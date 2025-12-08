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
  const [originalProfile, setOriginalProfile] = useState<StudentProfile | null>(
    null
  );

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
          credentials: "include", // ✅ send cookies (JWT) with request
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
        credentials: "include", // ✅ send cookies
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
      <div
        style={{
          minHeight: "100vh",
          background: "#020617",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e5e7eb",
        }}
      >
        Loading profile...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #1e293b 0, #020617 55%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              Student Profile
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              This profile is what mentors and recruiters will see when
              evaluating you.
            </p>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
            <div style={{ fontWeight: 500 }}>{name || "Unnamed Student"}</div>
            <div style={{ color: "#9ca3af" }}>{email}</div>
          </div>
        </header>

        {/* Main card */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(30,64,175,0.45), rgba(15,23,42,0.95))",
            borderRadius: "1.25rem",
            padding: "1.5rem",
            border: "1px solid rgba(148,163,184,0.35)",
            boxShadow:
              "0 24px 60px rgba(15,23,42,0.9), 0 0 0 1px rgba(15,23,42,0.6)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.4fr)",
            gap: "1.5rem",
          }}
        >
          {/* Left: Form */}
          <form onSubmit={handleSave} style={{ minWidth: 0 }}>
            {/* Bio */}
            <section style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  About You
                </h2>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#9ca3af",
                  }}
                >
                  {profile.bio?.length || 0}/500
                </span>
              </div>
              <textarea
                value={profile.bio}
                onChange={handleBioChange}
                disabled={!isEditing}
                rows={4}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(15,23,42,0.9)",
                  borderRadius: "0.75rem",
                  border: fieldErrors.bio
                    ? "1px solid #f97373"
                    : "1px solid rgba(148,163,184,0.6)",
                  padding: "0.75rem",
                  color: "#e5e7eb",
                  fontSize: "0.9rem",
                  outline: "none",
                  resize: "vertical",
                }}
                placeholder="Tell mentors about your interests, experience, and goals..."
              />
              {fieldErrors.bio && (
                <p style={{ color: "#f97373", fontSize: "0.75rem" }}>
                  {fieldErrors.bio}
                </p>
              )}
            </section>

            {/* Skills */}
            <section style={{ marginBottom: "1rem" }}>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.35rem",
                }}
              >
                Skills
              </h2>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  marginBottom: "0.35rem",
                }}
              >
                Add the technologies and domains you can work on. These show up
                as tags for mentors.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="text"
                  value={skillInput}
                  onChange={handleSkillInputChange}
                  disabled={!isEditing}
                  placeholder="e.g. React, Node.js, Machine Learning"
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(15,23,42,0.9)",
                    borderRadius: "999px",
                    border: fieldErrors.skills
                      ? "1px solid #f97373"
                      : "1px solid rgba(148,163,184,0.6)",
                    padding: "0.5rem 0.75rem",
                    color: "#e5e7eb",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!isEditing}
                  style={{
                    borderRadius: "999px",
                    border: "none",
                    padding: "0.45rem 0.9rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: isEditing ? "pointer" : "not-allowed",
                    background:
                      "linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)",
                    color: "#f9fafb",
                    opacity: isEditing ? 1 : 0.5,
                  }}
                >
                  Add
                </button>
              </div>
              {fieldErrors.skills && (
                <p style={{ color: "#f97373", fontSize: "0.75rem" }}>
                  {fieldErrors.skills}
                </p>
              )}
              <div
                style={{
                  marginTop: "0.25rem",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.4rem",
                }}
              >
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      border: "1px solid rgba(148,163,184,0.8)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.8rem",
                      background:
                        "radial-gradient(circle at top left, rgba(56,189,248,0.16), rgba(15,23,42,0.96))",
                    }}
                  >
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          color: "#f97373",
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </section>

            {/* Education */}
            <section style={{ marginBottom: "1rem" }}>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginBottom: "0.35rem",
                }}
              >
                Education
              </h2>
              <div style={{ marginBottom: "0.45rem" }}>
                <label style={{ fontSize: "0.8rem" }}>
                  College Name
                  <input
                    type="text"
                    value={profile.education?.collegeName || ""}
                    onChange={handleEducationChange("collegeName")}
                    disabled={!isEditing}
                    style={{
                      width: "100%",
                      marginTop: "0.15rem",
                      backgroundColor: "rgba(15,23,42,0.9)",
                      borderRadius: "0.6rem",
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: "0.45rem 0.6rem",
                      color: "#e5e7eb",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                  />
                </label>
              </div>
              <div style={{ marginBottom: "0.45rem" }}>
                <label style={{ fontSize: "0.8rem" }}>
                  Degree
                  <input
                    type="text"
                    value={profile.education?.degree || ""}
                    onChange={handleEducationChange("degree")}
                    disabled={!isEditing}
                    style={{
                      width: "100%",
                      marginTop: "0.15rem",
                      backgroundColor: "rgba(15,23,42,0.9)",
                      borderRadius: "0.6rem",
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: "0.45rem 0.6rem",
                      color: "#e5e7eb",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                    placeholder="B.Tech, M.Tech, etc."
                  />
                </label>
              </div>
              <div style={{ marginBottom: "0.45rem" }}>
                <label style={{ fontSize: "0.8rem" }}>
                  Branch
                  <input
                    type="text"
                    value={profile.education?.branch || ""}
                    onChange={handleEducationChange("branch")}
                    disabled={!isEditing}
                    style={{
                      width: "100%",
                      marginTop: "0.15rem",
                      backgroundColor: "rgba(15,23,42,0.9)",
                      borderRadius: "0.6rem",
                      border: "1px solid rgba(148,163,184,0.6)",
                      padding: "0.45rem 0.6rem",
                      color: "#e5e7eb",
                      fontSize: "0.85rem",
                      outline: "none",
                    }}
                    placeholder="ECE, CSE, etc."
                  />
                </label>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem" }}>
                    Start Year
                    <input
                      type="number"
                      value={profile.education?.startYear || ""}
                      onChange={handleEducationChange("startYear")}
                      disabled={!isEditing}
                      style={{
                        width: "110px",
                        marginTop: "0.15rem",
                        backgroundColor: "rgba(15,23,42,0.9)",
                        borderRadius: "0.6rem",
                        border: fieldErrors.startYear
                          ? "1px solid #f97373"
                          : "1px solid rgba(148,163,184,0.6)",
                        padding: "0.45rem 0.6rem",
                        color: "#e5e7eb",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    />
                    {fieldErrors.startYear && (
                      <p
                        style={{
                          color: "#f97373",
                          fontSize: "0.75rem",
                          marginTop: "0.1rem",
                        }}
                      >
                        {fieldErrors.startYear}
                      </p>
                    )}
                  </label>
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem" }}>
                    End Year
                    <input
                      type="number"
                      value={profile.education?.endYear || ""}
                      onChange={handleEducationChange("endYear")}
                      disabled={!isEditing}
                      style={{
                        width: "110px",
                        marginTop: "0.15rem",
                        backgroundColor: "rgba(15,23,42,0.9)",
                        borderRadius: "0.6rem",
                        border: fieldErrors.endYear
                          ? "1px solid #f97373"
                          : "1px solid rgba(148,163,184,0.6)",
                        padding: "0.45rem 0.6rem",
                        color: "#e5e7eb",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    />
                    {fieldErrors.endYear && (
                      <p
                        style={{
                          color: "#f97373",
                          fontSize: "0.75rem",
                          marginTop: "0.1rem",
                        }}
                      >
                        {fieldErrors.endYear}
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgba(148,163,184,0.8)",
                    padding: "0.45rem 0.9rem",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    backgroundColor: "transparent",
                    color: "#e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  Edit Profile
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      borderRadius: "999px",
                      border: "none",
                      padding: "0.45rem 0.9rem",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      backgroundColor: "rgba(15,23,42,0.9)",
                      color: "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      borderRadius: "999px",
                      border: "none",
                      padding: "0.45rem 1.1rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: saving ? "wait" : "pointer",
                      background:
                        "linear-gradient(135deg, #22c55e, #16a34a, #0ea5e9)",
                      color: "#0f172a",
                    }}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>

            {error && (
              <p
                style={{
                  marginTop: "0.5rem",
                  color: "#f97373",
                  fontSize: "0.8rem",
                }}
              >
                {error}
              </p>
            )}
          </form>

          {/* Right: Profile preview & visibility */}
          <aside
            style={{
              borderRadius: "1rem",
              background:
                "radial-gradient(circle at top, rgba(15,118,110,0.25), rgba(15,23,42,0.95))",
              border: "1px solid rgba(148,163,184,0.4)",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Avatar + basic info */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "999px",
                  border: "2px solid rgba(94,234,212,0.75)",
                  overflow: "hidden",
                  background:
                    "radial-gradient(circle at top, #22c55e, #0f172a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "1.4rem",
                  color: "#022c22",
                }}
              >
                {profile.profilePhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profilePhotoUrl}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  (name || email || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 600 }}>
                  {name || "Unnamed Student"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                  {email}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    marginTop: "0.35rem",
                    color:
                      profile.visibility === "PUBLIC"
                        ? "#4ade80"
                        : "#f97373",
                  }}
                >
                  {profile.visibility === "PUBLIC"
                    ? "Visible to mentors & recruiters"
                    : "Profile is private"}
                </div>
              </div>
            </div>

            {/* Visibility control */}
            <div>
              <label style={{ fontSize: "0.8rem" }}>
                Profile Visibility
                <select
                  value={profile.visibility}
                  onChange={handleVisibilityChange}
                  disabled={!isEditing}
                  style={{
                    width: "100%",
                    marginTop: "0.35rem",
                    backgroundColor: "rgba(15,23,42,0.9)",
                    borderRadius: "0.6rem",
                    border: "1px solid rgba(148,163,184,0.7)",
                    padding: "0.45rem 0.6rem",
                    color: "#e5e7eb",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                >
                  <option value="PUBLIC">
                    Public (recommended for mentorship)
                  </option>
                  <option value="PRIVATE">Private (only you can view)</option>
                </select>
              </label>
            </div>

            {/* Social links preview */}
            <div>
              <h3
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  marginBottom: "0.3rem",
                }}
              >
                Social Links
              </h3>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <p>
                  LinkedIn:{" "}
                  {profile.socialLinks?.linkedin
                    ? profile.socialLinks.linkedin
                    : "Not added"}
                </p>
                <p>
                  GitHub:{" "}
                  {profile.socialLinks?.github
                    ? profile.socialLinks.github
                    : "Not added"}
                </p>
                <p>
                  Portfolio:{" "}
                  {profile.socialLinks?.portfolio
                    ? profile.socialLinks.portfolio
                    : "Not added"}
                </p>
              </div>
            </div>

            {/* Small note */}
            <p
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                marginTop: "auto",
              }}
            >
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