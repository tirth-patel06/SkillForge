import { X, Mail, Globe, Github, Linkedin, ExternalLink, Code2 } from "lucide-react";
import type { PublicStudentProfile } from "@/api/studentProfile";

interface StudentProfileModalProps {
  student: PublicStudentProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentProfileModal({
  student,
  isOpen,
  onClose,
}: StudentProfileModalProps) {
  if (!isOpen || !student) return null;

  const profile = student.profile;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] z-50 overflow-hidden">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={handleCloseClick}
            className="absolute top-4 right-4 p-2 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5 text-zinc-300" />
          </button>

          {/* Profile Content */}
          <div className="p-8">
            {/* Profile Photo and Basic Info */}
            <div className="flex items-start gap-6 mb-8">
              <div className="relative w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-zinc-800 flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0 shadow-lg">
                {profile?.profilePhotoUrl ? (
                  <img
                    src={profile.profilePhotoUrl}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  student.name?.charAt(0).toUpperCase() || "S"
                )}
                {typeof student.score === "number" && (
                  <span className="absolute -bottom-1 -right-1 min-w-7 h-7 px-2 bg-blue-950 text-blue-200 text-xs font-semibold rounded-full border border-blue-500/40 flex items-center justify-center shadow">
                    {student.score}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {student.name || "Student"}
                </h2>
                <div className="flex items-center gap-2 text-zinc-400 mb-3">
                  <Mail className="w-4 h-4" />
                  <p className="text-sm">{student.email}</p>
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-300 text-xs font-semibold rounded-full border border-blue-500/30">
                  {student.role}
                  {typeof student.score === "number" && (
                    <span className="px-2 py-0.5 bg-blue-950/60 text-blue-200 rounded-full text-[11px] border border-blue-500/30">
                      {student.score}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Bio Section */}
            {profile?.bio && (
              <div className="mb-6 pb-6 border-b border-zinc-800">
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Skills Section */}
            {profile?.skills && profile.skills.length > 0 && (
              <div className="mb-6 pb-6 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-300 text-xs font-medium rounded-full border border-blue-500/30 hover:border-blue-400 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {profile?.education && (
              <div className="mb-6 pb-6 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-200 mb-3">Education</h3>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                  {profile.education.collegeName && (
                    <p className="text-white font-semibold mb-1">
                      {profile.education.collegeName}
                    </p>
                  )}
                  {profile.education.degree && (
                    <p className="text-zinc-400 text-sm">
                      {profile.education.degree}
                      {profile.education.branch && ` in ${profile.education.branch}`}
                    </p>
                  )}
                  {(profile.education.startYear || profile.education.endYear) && (
                    <p className="text-zinc-500 text-xs mt-2">
                      {profile.education.startYear} - {profile.education.endYear || "Present"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Social Links Section */}
            {profile?.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-3">Connect</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.socialLinks.github && (
                    <a
                      href={profile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-blue-500 hover:bg-blue-600/20 transition-all text-sm"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                      <span className="text-zinc-300 hover:text-blue-300">GitHub</span>
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-blue-500 hover:bg-blue-600/20 transition-all text-sm"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="text-zinc-300 hover:text-blue-300">LinkedIn</span>
                    </a>
                  )}
                  {profile.socialLinks.portfolio && (
                    <a
                      href={profile.socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-blue-500 hover:bg-blue-600/20 transition-all text-sm"
                      title="Portfolio"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="text-zinc-300 hover:text-blue-300">Portfolio</span>
                    </a>
                  )}
                  {profile.socialLinks.x && (
                    <a
                      href={profile.socialLinks.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-blue-500 hover:bg-blue-600/20 transition-all text-sm"
                      title="X (Twitter)"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-zinc-300 hover:text-blue-300">X</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
