"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MentorLayout } from "@/components/MentorLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  FileText,
  Mail,
  MapPin,
  Github,
  Linkedin,
  Globe,
  Save,
  Edit2,
  X,
  Upload,
  Award,
  Users,
  CheckCircle,
} from "lucide-react";

interface MentorProfile {
  bio: string;
  profilePhotoUrl: string;
  expertise: string[];
  yearsOfExperience: number;
  organization: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    website?: string;
  };
  visibility: "PUBLIC" | "PRIVATE";
}

interface MentorStats {
  tasksCreated: number;
  submissionsReviewed: number;
  referralsGiven: number;
  averageRating?: number;
}

const emptyProfile: MentorProfile = {
  bio: "",
  profilePhotoUrl: "",
  expertise: [],
  yearsOfExperience: 0,
  organization: "",
  socialLinks: {
    github: "",
    linkedin: "",
    portfolio: "",
    website: "",
  },
  visibility: "PUBLIC",
};

function MentorProfilePageInner() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<MentorProfile>(emptyProfile);
  const [stats, setStats] = useState<MentorStats>({
    tasksCreated: 0,
    submissionsReviewed: 0,
    referralsGiven: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [expertiseInput, setExpertiseInput] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    fetchMentorProfile();
    fetchMentorStats();
  }, []);

  const fetchMentorProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/mentors/me/profile");
      setProfile(res.data.profile || emptyProfile);
      setPhotoPreview(res.data.profile?.profilePhotoUrl || null);
    } catch (err) {
      console.error("Fetch profile error:", err);
      const error = err as { response?: { status: number } };
      if (error.response?.status === 404) {
        // Profile doesn't exist yet, use empty profile
        setProfile(emptyProfile);
      } else {
        setError("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorStats = async () => {
    try {
      const res = await api.get("/mentors/me/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!profile.bio.trim()) {
        setError("Bio is required");
        return;
      }

      const res = await api.put("/mentors/me/profile", profile);
      setProfile(res.data.profile || profile);
      setPhotoPreview(res.data.profile?.profilePhotoUrl);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      const error = err as { response?: { data?: { message: string } } };
      setError(error.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpertise = () => {
    if (expertiseInput.trim() && !profile.expertise.includes(expertiseInput.trim())) {
      setProfile({
        ...profile,
        expertise: [...profile.expertise, expertiseInput.trim()],
      });
      setExpertiseInput("");
    }
  };

  const handleRemoveExpertise = (skill: string) => {
    setProfile({
      ...profile,
      expertise: profile.expertise.filter((s) => s !== skill),
    });
  };

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      setError(null);

      // Create preview while uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server which handles Cloudinary
      const formData = new FormData();
      formData.append("image", file);

      // Don't set Content-Type header - let axios/browser handle it with proper boundary
      const res = await api.post("/mentors/me/upload-profile-image", formData);

      if (res.data.success) {
        const updatedProfile = {
          ...profile,
          profilePhotoUrl: res.data.imageUrl,
        };
        setProfile(updatedProfile);
        setPhotoPreview(res.data.imageUrl);
        
        // Save the updated profile to database immediately
        try {
          await api.put("/mentors/me/profile", updatedProfile);
          setSuccess("Profile photo updated successfully!");
        } catch (err) {
          console.error("Error saving profile:", err);
          setError("Photo uploaded but failed to save profile");
        }
      }
    } catch (err) {
      console.error("Photo upload error:", err);
      setError("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleNavigate = (page: string) => {
    const routeMap: Record<string, string> = {
      dashboard: "/mentor/dashboard",
      "my-tasks": "/mentor/dashboard?page=my-tasks",
      "create-task": "/mentor/dashboard?page=create-task",
      reviews: "/mentor/dashboard?page=reviews",
      referrals: "/mentor/dashboard?page=referrals",
    };
    const route = routeMap[page] || "/mentor/dashboard";
    router.push(route);
  };

  if (loading) {
    return (
      <MentorLayout
        currentPage="dashboard"
        onNavigate={handleNavigate}
        user={user || undefined}
        onLogout={logout}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="text-zinc-400">Loading...</div>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout
      currentPage="dashboard"
      onNavigate={handleNavigate}
      user={user || undefined}
      onLogout={logout}
    >
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Mentor Profile</h1>
            <p className="text-zinc-400">Manage your professional presence and mentoring activities</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-semibold flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
              {/* Photo Section */}
              <div className="relative h-32 bg-linear-to-r from-zinc-800 to-zinc-900">
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Profile Info */}
              <div className="p-6 -mt-12 relative z-10">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt={user?.name}
                    className="w-24 h-24 rounded-full border-4 border-zinc-950 object-cover mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-zinc-950 bg-linear-to-br from-zinc-700 to-zinc-800 flex items-center justify-center mb-4">
                    <span className="text-3xl font-bold text-white">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "M"}
                    </span>
                  </div>
                )}

                {isEditing && (
                  <label className="block text-sm text-zinc-400 mb-4 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                    <span className="inline-flex items-center space-x-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 transition-colors disabled:opacity-50">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingPhoto ? "Uploading..." : "Change Photo"}</span>
                    </span>
                  </label>
                )}

                <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                <div className="flex items-center space-x-2 text-zinc-400 mb-4">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>

                {!isEditing && profile.organization && (
                  <div className="flex items-center space-x-2 text-zinc-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.organization}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <StatCard icon={FileText} label="Tasks Created" value={stats.tasksCreated} />
              <StatCard icon={CheckCircle} label="Submissions Reviewed" value={stats.submissionsReviewed} />
              <StatCard icon={Users} label="Referrals Given" value={stats.referralsGiven} />
              {stats.averageRating && (
                <StatCard icon={Award} label="Average Rating" value={`${stats.averageRating.toFixed(1)}/5`} />
              )}
            </div>
          </div>

          {/* Right Column - Editable Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">About Me</h3>
              {isEditing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself, your experience, and mentoring approach..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 resize-none h-32"
                />
              ) : (
                <p className="text-zinc-300 leading-relaxed">
                  {profile.bio || "No bio added yet. Click edit to add one."}
                </p>
              )}
            </div>

            {/* Experience Section */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Professional Details</h3>
              <div className="space-y-4">
                {/* Organization */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Organization</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.organization}
                      onChange={(e) =>
                        setProfile({ ...profile, organization: e.target.value })
                      }
                      placeholder="e.g., Tech Company, University"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  ) : (
                    <p className="text-zinc-300">
                      {profile.organization || "Not specified"}
                    </p>
                  )}
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Years of Experience
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profile.yearsOfExperience}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          yearsOfExperience: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  ) : (
                    <p className="text-zinc-300">
                      {profile.yearsOfExperience} years
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Expertise Section */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Areas of Expertise</h3>
              <div className="space-y-4">
                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddExpertise();
                        }
                      }}
                      placeholder="Add expertise (press Enter)"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                    <button
                      onClick={handleAddExpertise}
                      className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.length > 0 ? (
                    profile.expertise.map((skill, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center space-x-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full"
                      >
                        <span className="text-sm text-zinc-300">{skill}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveExpertise(skill)}
                            className="text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-sm">
                      {isEditing
                        ? "Add your areas of expertise"
                        : "No expertise added yet"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
              <div className="space-y-4">
                {/* GitHub */}
                <div>
                  <label className="flex items-center space-x-2 text-sm text-zinc-400 mb-2">
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.socialLinks.github || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: {
                            ...profile.socialLinks,
                            github: e.target.value,
                          },
                        })
                      }
                      placeholder="https://github.com/username"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-sm"
                    />
                  ) : (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors text-sm break-all"
                    >
                      {profile.socialLinks.github || "Not added"}
                    </a>
                  )}
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="flex items-center space-x-2 text-sm text-zinc-400 mb-2">
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.socialLinks.linkedin || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: {
                            ...profile.socialLinks,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-sm"
                    />
                  ) : (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors text-sm break-all"
                    >
                      {profile.socialLinks.linkedin || "Not added"}
                    </a>
                  )}
                </div>

                {/* Portfolio */}
                <div>
                  <label className="flex items-center space-x-2 text-sm text-zinc-400 mb-2">
                    <Globe className="w-4 h-4" />
                    <span>Portfolio</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.socialLinks.portfolio || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: {
                            ...profile.socialLinks,
                            portfolio: e.target.value,
                          },
                        })
                      }
                      placeholder="https://yourportfolio.com"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-sm"
                    />
                  ) : (
                    <a
                      href={profile.socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors text-sm break-all"
                    >
                      {profile.socialLinks.portfolio || "Not added"}
                    </a>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="flex items-center space-x-2 text-sm text-zinc-400 mb-2">
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.socialLinks.website || ""}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          socialLinks: {
                            ...profile.socialLinks,
                            website: e.target.value,
                          },
                        })
                      }
                      placeholder="https://yourwebsite.com"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 text-sm"
                    />
                  ) : (
                    <a
                      href={profile.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white transition-colors text-sm break-all"
                    >
                      {profile.socialLinks.website || "Not added"}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Visibility Section */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Visibility</h3>
              {isEditing ? (
                <div className="flex gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="PUBLIC"
                      checked={profile.visibility === "PUBLIC"}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          visibility: e.target.value as "PUBLIC" | "PRIVATE",
                        })
                      }
                      className="accent-zinc-600"
                    />
                    <span className="text-zinc-300">Public</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="PRIVATE"
                      checked={profile.visibility === "PRIVATE"}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          visibility: e.target.value as "PUBLIC" | "PRIVATE",
                        })
                      }
                      className="accent-zinc-600"
                    />
                    <span className="text-zinc-300">Private</span>
                  </label>
                </div>
              ) : (
                <p className="text-zinc-300">
                  {profile.visibility === "PUBLIC"
                    ? "Your profile is visible to all users"
                    : "Your profile is only visible to you"}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-zinc-900 text-zinc-300 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MentorLayout>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-zinc-800 rounded-lg">
          <Icon className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function MentorProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["MENTOR"]}>
      <MentorProfilePageInner />
    </ProtectedRoute>
  );
}
