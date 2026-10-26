"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assertAdmin, isValidEmail } from "@/lib/auth";
import { saveSetting, type BusinessSettings, type DownloadSettings, type GstMode } from "@/lib/settings";

const GST_MODES: GstMode[] = ["NOT_REGISTERED", "INCLUSIVE", "EXCLUSIVE"];

function str(form: FormData, k: string) {
  return String(form.get(k) ?? "").trim();
}

function fail(msg: string, anchor: string): never {
  redirect(`/admin/settings?error=${encodeURIComponent(msg)}#${anchor}`);
}

export async function saveBusinessSettings(form: FormData) {
  await assertAdmin();
  const businessName = str(form, "businessName").slice(0, 120);
  if (!businessName) fail("Please enter your business name.", "business");

  const abn = str(form, "abn").replace(/\s+/g, " ");
  if (abn && !/^[\d ]+$/.test(abn)) fail("The ABN can only contain digits and spaces.", "business");
  if (abn && abn.replace(/ /g, "").length !== 11) fail("An ABN has 11 digits.", "business");

  const supportEmail = str(form, "supportEmail").toLowerCase();
  if (!isValidEmail(supportEmail)) fail("Please enter a valid support email address.", "business");

  const gstMode = str(form, "gstMode") as GstMode;
  if (!GST_MODES.includes(gstMode)) fail("Please choose how GST is handled.", "business");
  const gstRatePercent = Number(str(form, "gstRatePercent"));
  if (!Number.isFinite(gstRatePercent) || gstRatePercent < 0 || gstRatePercent > 50) fail("The GST rate must be a number from 0 to 50.", "business");

  const social: Pick<BusinessSettings, "instagramUrl" | "pinterestUrl" | "facebookUrl"> = { instagramUrl: "", pinterestUrl: "", facebookUrl: "" };
  for (const key of Object.keys(social) as (keyof typeof social)[]) {
    const url = str(form, key).slice(0, 300);
    if (url && !/^https:\/\/[^\s]+$/.test(url)) fail("Social media links must start with https:// (or be left blank).", "business");
    social[key] = url;
  }

  const value: BusinessSettings = { businessName, abn, supportEmail, gstMode, gstRatePercent, ...social };
  await saveSetting("business", value);
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1#business");
}

export async function saveDownloadSettings(form: FormData) {
  await assertAdmin();
  const accessLinkDays = Number(str(form, "accessLinkDays"));
  if (!Number.isInteger(accessLinkDays) || accessLinkDays < 1 || accessLinkDays > 365) fail("Download links must stay valid for 1 to 365 days.", "downloads");
  const maxDownloadsPerFile = Number(str(form, "maxDownloadsPerFile") || "0");
  if (!Number.isInteger(maxDownloadsPerFile) || maxDownloadsPerFile < 0 || maxDownloadsPerFile > 1000) fail("Maximum downloads must be a whole number from 0 (unlimited) to 1000.", "downloads");

  const value: DownloadSettings = { accessLinkDays, maxDownloadsPerFile };
  await saveSetting("downloads", value);
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1#downloads");
}
