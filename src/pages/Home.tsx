import { useNavigate } from 'react-router-dom';
import { Pencil, Search, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { PickerCard } from '@/components/ui/PickerCard';

// ── Home Page ─────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const username = user?.username ?? 'there';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow={today}
        title={`Hey, ${username}`}
        subtitle="What would you like to do today?"
      />

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
        <PickerCard
          big
          tint="blue"
          icon={Pencil}
          title="Log"
          subtitle="Document your work — daily, weekly, or a custom range."
          onClick={() => navigate('/log')}
        />
        <PickerCard
          big
          tint="cream"
          icon={Search}
          title="Recall"
          subtitle="Browse and ask about your logs with AI."
          onClick={() => navigate('/recall')}
        />
      </div>

      {/* Tip row */}
      <div className="mt-10 flex items-center gap-2 text-[13px] text-ink-3">
        <Sparkles size={14} className="text-accent-light flex-shrink-0" />
        <span>
          Tip — your logs power Recall. The more you log, the better the answers.
        </span>
      </div>
    </div>
  );
}
