import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FormState {
  // Contact info
  name: string;
  email: string;
  phone: string;
  message: string;
  
  // Service selection (from dependent dropdowns)
  service: string;
  stylist: string;
  date: string;
  time: string;
  
  // Quiz answers
  quizAnswers: Record<string, string>;
  
  // Consultation answers
  hairType: string;
  faceShape: string;
  maintenance: string;
  colourMuse: string;
  budget: string;
  
  // Addons
  addons: string[];
  
  // Metadata
  pageUrl: string;
  
  // Actions
  setField: (field: string, value: any) => void;
  setQuizAnswer: (question: string, answer: string) => void;
  setConsultationAnswer: (field: string, value: string) => void;
  addAddon: (addon: string) => void;
  removeAddon: (addon: string) => void;
  clearForm: () => void;
  getStateForSubmission: () => Record<string, any>;
}

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      // Initial state
      name: '',
      email: '',
      phone: '',
      message: '',
      service: '',
      stylist: '',
      date: '',
      time: '',
      quizAnswers: {},
      hairType: '',
      faceShape: '',
      maintenance: '',
      colourMuse: '',
      budget: '',
      addons: [],
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      
      // Set any field by name
      setField: (field: string, value: any) => {
        set({ [field]: value });
      },
      
      // Set quiz answer
      setQuizAnswer: (question: string, answer: string) => {
        set((state) => ({
          quizAnswers: { ...state.quizAnswers, [question]: answer },
        }));
      },
      
      // Set consultation answer
      setConsultationAnswer: (field: string, value: string) => {
        set({ [field]: value });
      },
      
      // Add addon
      addAddon: (addon: string) => {
        set((state) => ({
          addons: state.addons.includes(addon) 
            ? state.addons 
            : [...state.addons, addon],
        }));
      },
      
      // Remove addon
      removeAddon: (addon: string) => {
        set((state) => ({
          addons: state.addons.filter((a) => a !== addon),
        }));
      },
      
      // Clear all form data
      clearForm: () => {
        set({
          name: '',
          email: '',
          phone: '',
          message: '',
          service: '',
          stylist: '',
          date: '',
          time: '',
          quizAnswers: {},
          hairType: '',
          faceShape: '',
          maintenance: '',
          colourMuse: '',
          budget: '',
          addons: [],
        });
      },
      
      // Get complete state for form submission
      getStateForSubmission: () => {
        const state = get();
        return {
          name: state.name,
          email: state.email,
          phone: state.phone,
          message: state.message,
          service: state.service,
          stylist: state.stylist,
          date: state.date,
          time: state.time,
          quiz_answers: state.quizAnswers,
          hair_type: state.hairType,
          face_shape: state.faceShape,
          maintenance: state.maintenance,
          colour_muse: state.colourMuse,
          budget: state.budget,
          addons: state.addons,
          page_url: state.pageUrl,
        };
      },
    }),
    {
      name: 'luxe-form-state',
      partialize: (state) => ({
        // Only persist these fields
        service: state.service,
        stylist: state.stylist,
        date: state.date,
        time: state.time,
        quizAnswers: state.quizAnswers,
        hairType: state.hairType,
        faceShape: state.faceShape,
        maintenance: state.maintenance,
        colourMuse: state.colourMuse,
        budget: state.budget,
        addons: state.addons,
      }),
    }
  )
);
