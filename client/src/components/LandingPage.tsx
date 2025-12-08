import { ChevronRight, Users, Target, Award, CheckCircle, MessageSquare, TrendingUp, Lock } from 'lucide-react';

type LandingPageProps = {
  onGetStarted: () => void;
};

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">The Obsidian Circle</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-medium"
          >
            Enter Platform
          </button>
        </div>
      </nav>

      <div className="pt-32">
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-full text-sm text-zinc-300 mb-6">
              Bridging Alumni and Students
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Real-World Tasks Meet
            <span className="block bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-300 bg-clip-text text-transparent">
              Measurable Excellence
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Hawkins Institute faced a critical gap: students had no structured way to connect with alumni, contributions went untracked, and mentors struggled to identify genuine performers. The Obsidian Circle transforms mentorship from informal guidance into a transparent, achievement-driven platform.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-semibold flex items-center justify-center space-x-2 text-lg"
            >
              <span>Launch Dashboard</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox
              number="3"
              label="User Roles"
              description="Students, Mentors, Admins with tailored experiences"
            />
            <StatBox
              number="100%"
              label="Transparent Tracking"
              description="Every contribution recorded and evaluated"
            />
            <StatBox
              number="∞"
              label="Scalable Growth"
              description="From tasks to careers, tracked end-to-end"
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Three Essential Roles</h2>
            <p className="text-xl text-zinc-400">Each role has powerful tools designed for their unique needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <RoleCard
              role="Students & Teams"
              icon={Users}
              gradient="from-zinc-700 to-zinc-800"
              features={[
                'Join and create teams for collaborative work',
                'Browse real-world tasks with clear rubrics',
                'Submit work iteratively with version history',
                'Earn badges and track contributions',
                'Build verifiable portfolio of achievements',
                'Request mentorship and referrals',
              ]}
            />

            <RoleCard
              role="Alumni Mentors"
              icon={Target}
              gradient="from-zinc-700 to-zinc-800"
              features={[
                'Post real-world tasks with rubrics',
                'Review submissions with structured feedback',
                'Score fairly using transparent criteria',
                'Write impactful referrals with evidence',
                'Manage team assignments and deadlines',
                'Track mentoring impact and history',
              ]}
            />

            <RoleCard
              role="Platform Admins"
              icon={Lock}
              gradient="from-zinc-700 to-zinc-800"
              features={[
                'Verify alumni and manage user roles',
                'Moderate tasks for quality and compliance',
                'Handle disputes with audit trails',
                'Monitor platform metrics and activity',
                'Configure system defaults and rules',
                'Ensure accountability and fairness',
              ]}
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-3xl font-bold mb-8">Why The Obsidian Circle?</h3>
                <div className="space-y-6">
                  <ProblemSolution
                    problem="Informal mentorship loses guidance"
                    solution="Structured platform with documented feedback"
                  />
                  <ProblemSolution
                    problem="Contributions go untracked and unrecognized"
                    solution="Every submission scored, versioned, and auditable"
                  />
                  <ProblemSolution
                    problem="Alumni hesitate to recommend unproven students"
                    solution="Transparent referrals with evidence links and credentials"
                  />
                  <ProblemSolution
                    problem="No fair way to evaluate real work"
                    solution="Custom rubrics with weighted criteria by mentors"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <FeatureHighlight
                    title="Transparent Work"
                    description="All tasks, submissions, and evaluations visible to stakeholders"
                    icon={Award}
                    accentColor="from-zinc-700 to-zinc-800"
                  />
                  <FeatureHighlight
                    title="Fair Evaluation"
                    description="Rubric-based scoring removes bias and ensures consistency"
                    icon={CheckCircle}
                    accentColor="from-zinc-700 to-zinc-800"
                  />
                  <FeatureHighlight
                    title="Lasting Records"
                    description="Version history and audit trails for complete accountability"
                    icon={TrendingUp}
                    accentColor="from-zinc-700 to-zinc-800"
                  />
                  <FeatureHighlight
                    title="Real Communication"
                    description="Task-specific threads for clarifications and collaboration"
                    icon={MessageSquare}
                    accentColor="from-zinc-700 to-zinc-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">Platform Capabilities</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CapabilityBox
              title="Task Management"
              description="Create tasks with rubrics, assign to teams, track progress"
              accentColor="from-zinc-700 to-zinc-800"
            />
            <CapabilityBox
              title="Smart Reviews"
              description="Score submissions against criteria with detailed feedback"
              accentColor="from-zinc-700 to-zinc-800"
            />
            <CapabilityBox
              title="Contribution Tracking"
              description="Complete history of work, badges, and achievements"
              accentColor="from-zinc-700 to-zinc-800"
            />
            <CapabilityBox
              title="Referral System"
              description="Structured recommendations with evidence links"
              accentColor="from-zinc-700 to-zinc-800"
            />
            <CapabilityBox
              title="Team Collaboration"
              description="Manage members, assign roles, coordinate work"
              accentColor="from-zinc-700 to-zinc-800"
            />
            <CapabilityBox
              title="Version Control"
              description="Submit iteratively, preserve all versions for review"
              accentColor="from-zinc-700 to-zinc-800"
            />
            <CapabilityBox
              title="Notifications"
              description="Real-time alerts for deadlines, reviews, and messages"
              accentColor="from-zinc-700 to-zinc-800"
            />
            <CapabilityBox
              title="Admin Tools"
              description="Moderation, disputes, analytics, and compliance"
              accentColor="from-zinc-700 to-zinc-800"
            />
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl p-12 md:p-16 text-center border border-zinc-700">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Mentorship?</h2>
            <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
              Join The Obsidian Circle and experience the future of alumni-student collaboration. Track real work. Earn real recognition. Build real careers.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-white text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors font-semibold text-lg"
            >
              Get Started Now
            </button>
          </div>
        </section>

        <footer className="border-t border-zinc-800 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-zinc-400">
              <p>&copy; 2025 The Obsidian Circle. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

type StatBoxProps = {
  number: string;
  label: string;
  description: string;
};

function StatBox({ number, label, description }: StatBoxProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 text-center hover:border-zinc-700 transition-colors">
      <p className="text-5xl font-bold bg-gradient-to-r from-zinc-300 to-zinc-400 bg-clip-text text-transparent mb-2">
        {number}
      </p>
      <h3 className="text-xl font-semibold text-white mb-2">{label}</h3>
      <p className="text-zinc-400">{description}</p>
    </div>
  );
}

type RoleCardProps = {
  role: string;
  icon: React.ElementType;
  gradient: string;
  features: string[];
};

function RoleCard({ role, icon: Icon, gradient, features }: RoleCardProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 hover:border-zinc-700 transition-all group overflow-hidden">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-6">{role}</h3>

      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ProblemSolutionProps = {
  problem: string;
  solution: string;
};

function ProblemSolution({ problem, solution }: ProblemSolutionProps) {
  return (
    <div>
      <div className="flex items-start space-x-3 mb-2">
        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-red-400">✕</span>
        </div>
        <p className="text-zinc-400">{problem}</p>
      </div>
      <div className="flex items-start space-x-3 ml-9 mb-4">
        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-green-400">✓</span>
        </div>
        <p className="text-green-400">{solution}</p>
      </div>
    </div>
  );
}

type FeatureHighlightProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
};

function FeatureHighlight({ title, description, icon: Icon, accentColor }: FeatureHighlightProps) {
  return (
    <div className="flex items-start space-x-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-700 transition-colors">
      <div className={`p-2 bg-gradient-to-br ${accentColor} rounded-lg flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
    </div>
  );
}

type CapabilityBoxProps = {
  title: string;
  description: string;
  accentColor: string;
};

function CapabilityBox({ title, description, accentColor }: CapabilityBoxProps) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accentColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <span className="text-white font-bold">✦</span>
      </div>
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  );
}
