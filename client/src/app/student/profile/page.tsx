"use client";

import React, { useEffect, useState } from "react";
import type {
  MeProfileResponse,
  StudentProfile,
  Education,
  SocialLinks,
  ProfileVisibility,
} from "@/types/studentProfile";

const API_BASE_URL = "http://localhost:8000"; // or from env later

const emptyProfile: StudentProfile = {
  bio: "",
  profilePhotoUrl: "",
  skills: [],
  education: null,
  socialLinks: null,
  visibility: "PUBLIC",
};

type FieldErrors = {
  bio?: string;
  profilePhotoUrl?: string;
  skills?: string;
  startYear?: string;
  endYear?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  x?: string;
};

const isValidUrl = (value: string | undefined) => {
  if (!value) return true;
  return /^https?:\/\/.+/i.test(value.trim());
};

const StudentProfilePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<StudentProfile>(emptyProfile);
  const [originalProfile, setOriginalProfile] =
    useState<StudentProfile | null>(null);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [skillInput, setSkillInput] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isEditing, setIsEditing] = useState<boolean>(true);

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/students/me/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // send cookies (JWT)
        });

        if (!res.ok) {
          throw new Error(`Failed to load profile (${res.status})`);
        }

        const data: MeProfileResponse = await res.json();

        setName(data.name || "");
        setEmail(data.email);
        const loadedProfile = data.profile || emptyProfile;
        setProfile(loadedProfile);
        setOriginalProfile(loadedProfile);
      } catch (err: any) {
        console.error("Fetch profile error:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Helpers to update nested fields
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProfile((prev) => ({ ...prev, bio: e.target.value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({ ...prev, profilePhotoUrl: e.target.value }));
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ProfileVisibility;
    setProfile((prev) => ({ ...prev, visibility: value }));
  };

  // Education handlers
  const updateEducation = (patch: Partial<Education>) => {
    setProfile((prev) => ({
      ...prev,
      education: {
        ...(prev.education || {}),
        ...patch,
      },
    }));
  };

  const handleEducationChange =
    (field: keyof Education) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === "startYear" || field === "endYear"
          ? e.target.value
            ? Number(e.target.value)
            : undefined
          : e.target.value;
      updateEducation({ [field]: value } as Partial<Education>);
    };

  // Social links handlers
  const updateSocialLinks = (patch: Partial<SocialLinks>) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        ...patch,
      },
    }));
  };

  const handleSocialChange =
    (field: keyof SocialLinks) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSocialLinks({ [field]: e.target.value });
    };

  // Skills handlers
  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillInput(e.target.value);
  };

  const handleAddSkill = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    setProfile((prev) =>
      prev.skills.includes(trimmed)
        ? prev
        : { ...prev, skills: [...prev.skills, trimmed] }
    );
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  // Validation
  const validateProfile = (): boolean => {
    const errors: FieldErrors = {};

    if (profile.bio && profile.bio.length > 500) {
      errors.bio = "Bio should be at most 500 characters.";
    }

    if (profile.skills.length > 25) {
      errors.skills = "You can add at most 25 skills.";
    }

    if (
      profile.education?.startYear &&
      (profile.education.startYear < 2000 ||
        profile.education.startYear > 2100)
    ) {
      errors.startYear = "Start year should be between 2000 and 2100.";
    }

    if (
      profile.education?.endYear &&
      (profile.education.endYear < 2000 ||
        profile.education.endYear > 2100)
    ) {
      errors.endYear = "End year should be between 2000 and 2100.";
    }

    if (
      profile.education?.startYear &&
      profile.education?.endYear &&
      profile.education.startYear > profile.education.endYear
    ) {
      errors.endYear = "End year should be >= start year.";
    }

    const socials = profile.socialLinks || {};
    if (!isValidUrl(socials.linkedin)) {
      errors.linkedin = "LinkedIn must be a valid URL starting with http(s).";
    }
    if (!isValidUrl(socials.github)) {
      errors.github = "GitHub must be a valid URL starting with http(s).";
    }
    if (!isValidUrl(socials.portfolio)) {
      errors.portfolio = "Portfolio must be a valid URL starting with http(s).";
    }
    if (!isValidUrl(socials.x)) {
      errors.x = "X (Twitter) must be a valid URL starting with http(s).";
    }

    if (!isValidUrl(profile.profilePhotoUrl)) {
      errors.profilePhotoUrl =
        "Profile photo URL must start with http:// or https://";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save profile (PUT)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/api/students/me/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        throw new Error(`Failed to save profile (${res.status})`);
      }

      const data = await res.json();
      if (data.profile) {
        setProfile((prev) => ({
          ...prev,
          ...data.profile,
        }));
        setOriginalProfile(data.profile);
      }

      setIsEditing(false);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setFieldErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-200">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Student Profile
            </h1>
            <p className="text-sm text-zinc-400">
              This profile is what mentors and recruiters will see when
              evaluating you.
            </p>
          </div>
          <div className="text-sm text-right">
            <p className="font-medium">{name || "Unnamed Student"}</p>
            <p className="text-zinc-400">{email}</p>
          </div>
        </header>

        {/* Main card */}
        <div className="rounded-2xl border border-zinc-800 bg-linear-to-br from-slate-900/80 via-black to-black shadow-[0_24px_60px_rgba(0,0,0,0.9)] p-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Left: Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* About you */}
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">About You</h2>
                <span className="text-[11px] text-zinc-500">
                  {profile.bio?.length || 0}/500
                </span>
              </div>
              <textarea
                value={profile.bio}
                onChange={handleBioChange}
                disabled={!isEditing}
                rows={4}
                className={`w-full rounded-xl border bg-black/80 px-3 py-2 text-sm text-slate-100 outline-none resize-y ${
                  fieldErrors.bio
                    ? "border-red-500/70"
                    : "border-zinc-700 focus:border-zinc-400"
                }`}
                placeholder="Tell mentors about your interests, experience, and goals..."
              />
              {fieldErrors.bio && (
                <p className="text-[11px] text-red-400">{fieldErrors.bio}</p>
              )}
            </section>

            {/* Profile photo URL */}
            <section className="space-y-1">
              <h2 className="text-sm font-semibold">Profile Photo URL</h2>
              <input
                type="text"
                value={profile.profilePhotoUrl || ""}
                onChange={handlePhotoChange}
                disabled={!isEditing}
                placeholder="https://your-image-url"
                className={`w-full rounded-xl border bg-black/80 px-3 py-2 text-sm text-slate-100 outline-none ${
                  fieldErrors.profilePhotoUrl
                    ? "border-red-500/70"
                    : "border-zinc-700 focus:border-zinc-400"
                }`}
              />
              {fieldErrors.profilePhotoUrl && (
                <p className="text-[11px] text-red-400">
                  {fieldErrors.profilePhotoUrl}
                </p>
              )}
            </section>

            {/* Skills */}
            <section className="space-y-2">
              <div>
                <h2 className="text-sm font-semibold">Skills</h2>
                <p className="text-[11px] text-zinc-500">
                  Add technologies and domains you can work on. These show up as
                  tags for mentors.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  disabled={!isEditing}
                  placeholder="e.g. React, Node.js, Machine Learning"
                  className={`flex-1 rounded-full border bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none ${
                    fieldErrors.skills
                      ? "border-red-500/70"
                      : "border-zinc-700 focus:border-zinc-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!isEditing}
                  className={`rounded-full px-3 py-2 text-xs font-medium text-slate-50 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 ${
                    isEditing ? "" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Add
                </button>
              </div>

              {fieldErrors.skills && (
                <p className="text-[11px] text-red-400">
                  {fieldErrors.skills}
                </p>
              )}

              <div className="mt-1 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-600 bg-linear-to-br from-sky-500/10 to-slate-950 px-2 py-1 text-[11px]"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-red-400 text-[11px]"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </section>

            {/* Education */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold">Education</h2>

              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400">
                  College Name
                  <input
                    type="text"
                    value={profile.education?.collegeName || ""}
                    onChange={handleEducationChange("collegeName")}
                    disabled={!isEditing}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none focus:border-zinc-400"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400">
                  Degree
                  <input
                    type="text"
                    value={profile.education?.degree || ""}
                    onChange={handleEducationChange("degree")}
                    disabled={!isEditing}
                    placeholder="B.Tech, M.Tech, etc."
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none focus:border-zinc-400"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400">
                  Branch
                  <input
                    type="text"
                    value={profile.education?.branch || ""}
                    onChange={handleEducationChange("branch")}
                    disabled={!isEditing}
                    placeholder="ECE, CSE, etc."
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none focus:border-zinc-400"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">
                    Start Year
                    <input
                      type="number"
                      value={profile.education?.startYear || ""}
                      onChange={handleEducationChange("startYear")}
                      disabled={!isEditing}
                      className={`mt-1 w-28 rounded-lg border bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none ${
                        fieldErrors.startYear
                          ? "border-red-500/70"
                          : "border-zinc-700 focus:border-zinc-400"
                      }`}
                    />
                  </label>
                  {fieldErrors.startYear && (
                    <p className="text-[11px] text-red-400">
                      {fieldErrors.startYear}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">
                    End Year
                    <input
                      type="number"
                      value={profile.education?.endYear || ""}
                      onChange={handleEducationChange("endYear")}
                      disabled={!isEditing}
                      className={`mt-1 w-28 rounded-lg border bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none ${
                        fieldErrors.endYear
                          ? "border-red-500/70"
                          : "border-zinc-700 focus:border-zinc-400"
                      }`}
                    />
                  </label>
                  {fieldErrors.endYear && (
                    <p className="text-[11px] text-red-400">
                      {fieldErrors.endYear}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Social links inputs */}
            <section className="space-y-2">
              <h2 className="text-sm font-semibold">Social Links</h2>
              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400">
                  LinkedIn
                  <input
                    type="text"
                    value={profile.socialLinks?.linkedin || ""}
                    onChange={handleSocialChange("linkedin")}
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/username"
                    className={`mt-1 w-full rounded-lg border bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none ${
                      fieldErrors.linkedin
                        ? "border-red-500/70"
                        : "border-zinc-700 focus:border-zinc-400"
                    }`}
                  />
                </label>
                {fieldErrors.linkedin && (
                  <p className="text-[11px] text-red-400">
                    {fieldErrors.linkedin}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400">
                  GitHub
                  <input
                    type="text"
                    value={profile.socialLinks?.github || ""}
                    onChange={handleSocialChange("github")}
                    disabled={!isEditing}
                    placeholder="https://github.com/username"
                    className={`mt-1 w-full rounded-lg border bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none ${
                      fieldErrors.github
                        ? "border-red-500/70"
                        : "border-zinc-700 focus:border-zinc-400"
                    }`}
                  />
                </label>
                {fieldErrors.github && (
                  <p className="text-[11px] text-red-400">
                    {fieldErrors.github}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400">
                  Portfolio
                  <input
                    type="text"
                    value={profile.socialLinks?.portfolio || ""}
                    onChange={handleSocialChange("portfolio")}
                    disabled={!isEditing}
                    placeholder="https://your-portfolio.com"
                    className={`mt-1 w-full rounded-lg border bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none ${
                      fieldErrors.portfolio
                        ? "border-red-500/70"
                        : "border-zinc-700 focus:border-zinc-400"
                    }`}
                  />
                </label>
                {fieldErrors.portfolio && (
                  <p className="text-[11px] text-red-400">
                    {fieldErrors.portfolio}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-zinc-400">
                  X (Twitter)
                  <input
                    type="text"
                    value={profile.socialLinks?.x || ""}
                    onChange={handleSocialChange("x")}
                    disabled={!isEditing}
                    placeholder="https://x.com/username"
                    className={`mt-1 w-full rounded-lg border bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none ${
                      fieldErrors.x
                        ? "border-red-500/70"
                        : "border-zinc-700 focus:border-zinc-400"
                    }`}
                  />
                </label>
                {fieldErrors.x && (
                  <p className="text-[11px] text-red-400">{fieldErrors.x}</p>
                )}
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-zinc-900"
                >
                  Edit Profile
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-linear-to-r from-emerald-500 via-green-500 to-sky-500 px-5 py-2 text-xs font-semibold text-slate-900 disabled:cursor-wait disabled:opacity-80"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>

            {error && (
              <p className="pt-1 text-[11px] text-red-400">{error}</p>
            )}
          </form>

          {/* Right: Profile preview & visibility */}
          <aside className="flex flex-col gap-4 rounded-2xl border border-emerald-500/20 bg-linear-to-b from-teal-900/30 via-slate-950 to-black px-4 py-4">
            {/* Avatar + basic info */}
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full border-2 border-emerald-300/70 bg-linear-to-b from-emerald-400 to-slate-900 flex items-center justify-center text-lg font-semibold text-emerald-950 overflow-hidden">
                {profile.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profilePhotoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  (name || email || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {name || "Unnamed Student"}
                </p>
                <p className="text-[11px] text-zinc-400">{email}</p>
                <p
                  className={`mt-1 text-[11px] ${
                    profile.visibility === "PUBLIC"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {profile.visibility === "PUBLIC"
                    ? "Visible to mentors & recruiters"
                    : "Profile is private"}
                </p>
              </div>
            </div>

            {/* Visibility control */}
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">
                Profile Visibility
                <select
                  value={profile.visibility}
                  onChange={handleVisibilityChange}
                  disabled={!isEditing}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-black/80 px-3 py-2 text-xs text-slate-100 outline-none focus:border-zinc-400"
                >
                  <option value="PUBLIC">
                    Public (recommended for mentorship)
                  </option>
                  <option value="PRIVATE">Private (only you can view)</option>
                </select>
              </label>
            </div>

            {/* Social links preview */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold">Social Links Preview</h3>
              <div className="space-y-1 text-[11px] text-zinc-400">
                <p>
                  <span className="text-zinc-300">LinkedIn:</span>{" "}
                  {profile.socialLinks?.linkedin || "Not added"}
                </p>
                <p>
                  <span className="text-zinc-300">GitHub:</span>{" "}
                  {profile.socialLinks?.github || "Not added"}
                </p>
                <p>
                  <span className="text-zinc-300">Portfolio:</span>{" "}
                  {profile.socialLinks?.portfolio || "Not added"}
                </p>
              </div>
            </div>

            {/* Tip */}
            <p className="mt-auto text-[11px] text-zinc-500">
              Tip: keep your skills, links, and education updated — mentors use
              this to decide who to assign real-world tasks to.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
