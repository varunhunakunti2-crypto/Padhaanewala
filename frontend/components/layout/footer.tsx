import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t hairline-border bg-[var(--color-canvas)] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-ink)]">Padhaanewala</h3>
            <p className="text-sm text-[var(--color-mute)]">
              Your premium destination for discovering and securing admission into the best colleges in India.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-ink)] mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-[var(--color-body)]">
              <li><Link href="/colleges" className="hover:text-[var(--color-link)]">Colleges</Link></li>
              <li><Link href="/courses" className="hover:text-[var(--color-link)]">Courses</Link></li>
              <li><Link href="/exams" className="hover:text-[var(--color-link)]">Exams</Link></li>
              <li><Link href="/scholarships" className="hover:text-[var(--color-link)]">Scholarships</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-ink)] mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-[var(--color-body)]">
              <li><Link href="/college-predictor" className="hover:text-[var(--color-link)]">College Predictor</Link></li>
              <li><Link href="/mock-tests" className="hover:text-[var(--color-link)]">Mock Tests</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--color-link)]">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--color-link)]">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-ink)] mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-[var(--color-body)]">
              <li><Link href="/privacy" className="hover:text-[var(--color-link)]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--color-link)]">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--color-link)]">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t hairline-border flex flex-col md:flex-row justify-between items-center text-sm text-[var(--color-faint)]">
          <p>&copy; {new Date().getFullYear()} Padhaanewala. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
