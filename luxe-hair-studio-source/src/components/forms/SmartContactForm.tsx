import { useState } from 'react';
import { useFormStore } from '../../lib/form-store';
import { Ic, toast } from '../Ornaments';

interface FormSettings {
  emailRecipient: string;
  emailSubject: string;
  successMessage: string;
  errorMessage: string;
  fromName: string;
  replyToField: string;
  enableNotifications: boolean;
  saveSubmissions: boolean;
  requiredFields: string[];
}

export default function SmartContactForm() {
  const formStore = useFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<FormSettings | null>(null);
  
  // Load form settings on mount
  useState(() => {
    fetch('/wp-json/luxe/v1/form/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionData = {
      ...formStore.getStateForSubmission(),
      nonce: window.__LUXE_CONFIG__?.nonce || '',
    };

    try {
      const response = await fetch('/wp-json/luxe/v1/form/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.success) {
        toast(result.message || 'Message sent successfully!');
        formStore.clearForm();
      } else {
        toast(result.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast(settings?.errorMessage || 'Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-base py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-medium text-ink">Get in Touch</h2>
          <p className="mt-4 text-inksoft">
            Ready to transform your look? Fill out the form below and we'll be in touch shortly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-linec bg-surface p-8 shadow-lg">
          {/* Pre-filled selections display */}
          {(formStore.service || formStore.stylist || formStore.date) && (
            <div className="mb-6 rounded-xl bg-rose-ghost p-4 border border-rose/30">
              <h3 className="font-mono text-xs uppercase tracking-widest text-rosedeep mb-3">
                Your Selections
              </h3>
              <div className="grid gap-2 text-sm">
                {formStore.service && (
                  <div className="flex justify-between">
                    <span className="text-inksoft">Service:</span>
                    <span className="font-medium text-ink">{formStore.service}</span>
                  </div>
                )}
                {formStore.stylist && (
                  <div className="flex justify-between">
                    <span className="text-inksoft">Stylist:</span>
                    <span className="font-medium text-ink">{formStore.stylist}</span>
                  </div>
                )}
                {formStore.date && (
                  <div className="flex justify-between">
                    <span className="text-inksoft">Preferred Date:</span>
                    <span className="font-medium text-ink">{formStore.date}</span>
                  </div>
                )}
                {formStore.time && (
                  <div className="flex justify-between">
                    <span className="text-inksoft">Preferred Time:</span>
                    <span className="font-medium text-ink">{formStore.time}</span>
                  </div>
                )}
                {formStore.hairType && (
                  <div className="flex justify-between">
                    <span className="text-inksoft">Hair Type:</span>
                    <span className="font-medium text-ink">{formStore.hairType}</span>
                  </div>
                )}
                {formStore.budget && (
                  <div className="flex justify-between">
                    <span className="text-inksoft">Budget:</span>
                    <span className="font-medium text-ink">{formStore.budget}</span>
                  </div>
                )}
                {formStore.addons.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-inksoft">Addons:</span>
                    <span className="font-medium text-ink">{formStore.addons.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-inksoft mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formStore.name}
                onChange={(e) => formStore.setField('name', e.target.value)}
                required
                className="w-full rounded-lg border border-linec bg-base px-4 py-3 text-ink focus:border-rosedeep focus:outline-none focus:ring-1 focus:ring-rosedeep"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-inksoft mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formStore.email}
                onChange={(e) => formStore.setField('email', e.target.value)}
                required
                className="w-full rounded-lg border border-linec bg-base px-4 py-3 text-ink focus:border-rosedeep focus:outline-none focus:ring-1 focus:ring-rosedeep"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-inksoft mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formStore.phone}
              onChange={(e) => formStore.setField('phone', e.target.value)}
              className="w-full rounded-lg border border-linec bg-base px-4 py-3 text-ink focus:border-rosedeep focus:outline-none focus:ring-1 focus:ring-rosedeep"
              placeholder="+44 20 1234 5678"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-inksoft mb-2">
              Message *
            </label>
            <textarea
              id="message"
              rows={5}
              value={formStore.message}
              onChange={(e) => formStore.setField('message', e.target.value)}
              required
              className="w-full rounded-lg border border-linec bg-base px-4 py-3 text-ink focus:border-rosedeep focus:outline-none focus:ring-1 focus:ring-rosedeep"
              placeholder="Tell us about what you're looking for..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-sheen w-full rounded-full border border-rosedeep/70 px-9 py-4 font-mono text-sm uppercase tracking-widest text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Ic.Loader className="h-5 w-5 animate-spin" />
                Sending...
              </span>
            ) : (
              'Send Message'
            )}
          </button>

          <p className="text-center text-xs text-inkfaint">
            By sending this message, you agree to our privacy policy. We'll never share your information with third parties.
          </p>
        </form>
      </div>
    </section>
  );
}
