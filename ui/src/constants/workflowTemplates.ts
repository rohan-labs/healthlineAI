import { FlowNode, FlowEdge, NodeType } from '@/components/flow/types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'outbound' | 'inbound';
  icon: string; // lucide icon name
  nodes: FlowNode[];
  edges: FlowEdge[];
  templateContextVariables: Record<string, string>;
  configurations?: {
    call_type: 'inbound' | 'outbound';
  };
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    description: 'Call patients to remind them about upcoming appointments and confirm attendance',
    category: 'outbound',
    icon: 'Calendar',
    configurations: {
      call_type: 'outbound',
    },
    nodes: [
      {
        id: '1',
        type: NodeType.START_CALL,
        position: { x: 250, y: 100 },
        data: {
          name: 'Greeting',
          prompt: "Hi {{patient_name}}, this is {{practice_name}}. We're calling to remind you about your appointment with Dr. {{doctor_name}} on {{appointment_date}} at {{appointment_time}}. Can you confirm you'll be able to make it?",
          allow_interrupt: true,
          add_global_prompt: true,
          extraction_enabled: true,
          extraction_prompt: "Extract whether the patient confirms the appointment (Yes/No) and if they need to reschedule, capture their preferred date.",
          extraction_variables: [
            {
              name: 'appointment_confirmed',
              type: 'string',
              prompt: "Did the patient confirm they can make the appointment? (Yes/No/Reschedule)"
            },
            {
              name: 'preferred_reschedule_date',
              type: 'string',
              prompt: "If rescheduling, what date did they request?"
            }
          ],
          is_start: true,
        }
      },
      {
        id: '2',
        type: NodeType.END_CALL,
        position: { x: 250, y: 300 },
        data: {
          name: 'Closing',
          prompt: "Thank you! We'll see you on {{appointment_date}}. If you need to reach us, call {{office_phone}}. Goodbye!",
          allow_interrupt: false,
          add_global_prompt: true,
          is_end: true,
        }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        data: {
          condition: '',
          label: ''
        }
      }
    ],
    templateContextVariables: {
      patient_name: 'John Smith',
      practice_name: 'ABC Medical Center',
      doctor_name: 'Williams',
      appointment_date: 'March 15th',
      appointment_time: '2:30 PM',
      office_phone: '555-1234'
    }
  },
  {
    id: 'medication-history',
    name: 'Medication History Collection',
    description: 'Collect current medications and allergies from patients before appointments',
    category: 'outbound',
    icon: 'Pill',
    configurations: {
      call_type: 'outbound',
    },
    nodes: [
      {
        id: '1',
        type: NodeType.START_CALL,
        position: { x: 250, y: 100 },
        data: {
          name: 'Introduction',
          prompt: "Hi {{patient_name}}, this is {{practice_name}}. We're updating our medication records for your upcoming visit. Do you have a few minutes to review your current medications?",
          allow_interrupt: true,
          add_global_prompt: true,
          detect_voicemail: true,
          is_start: true,
        }
      },
      {
        id: '2',
        type: NodeType.AGENT_NODE,
        position: { x: 250, y: 280 },
        data: {
          name: 'Collect Medications',
          prompt: "Please tell me all the medications you're currently taking, including the dosage if you know it. Also, let me know if you have any drug allergies.",
          allow_interrupt: true,
          add_global_prompt: true,
          extraction_enabled: true,
          extraction_prompt: "Extract all medications mentioned with dosages, and any drug allergies.",
          extraction_variables: [
            {
              name: 'current_medications',
              type: 'string',
              prompt: "List all medications and dosages mentioned"
            },
            {
              name: 'allergies',
              type: 'string',
              prompt: "Extract any drug allergies mentioned"
            }
          ]
        }
      },
      {
        id: '3',
        type: NodeType.END_CALL,
        position: { x: 250, y: 480 },
        data: {
          name: 'Thank You',
          prompt: "Thank you for providing this information. We've updated your records. See you at your appointment!",
          allow_interrupt: false,
          add_global_prompt: true,
          is_end: true,
        }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        data: {
          condition: '',
          label: ''
        }
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        data: {
          condition: '',
          label: ''
        }
      }
    ],
    templateContextVariables: {
      patient_name: 'Jane Doe',
      practice_name: 'ABC Medical Center'
    }
  },
  {
    id: 'pre-visit-triage',
    name: 'Pre-Visit Triage',
    description: 'Gather symptoms and schedule appointments based on urgency',
    category: 'inbound',
    icon: 'Stethoscope',
    configurations: {
      call_type: 'inbound',
    },
    nodes: [
      {
        id: '1',
        type: NodeType.START_CALL,
        position: { x: 250, y: 100 },
        data: {
          name: 'Greeting',
          prompt: "Thank you for calling {{practice_name}}. I'm here to help schedule your appointment. What's the main reason you'd like to see the doctor?",
          allow_interrupt: true,
          add_global_prompt: true,
          extraction_enabled: true,
          extraction_prompt: "Extract the patient's chief complaint and urgency level.",
          extraction_variables: [
            {
              name: 'chief_complaint',
              type: 'string',
              prompt: "What is the patient's main health concern?"
            },
            {
              name: 'urgency',
              type: 'string',
              prompt: "Is this urgent or routine? (Urgent/Routine)"
            }
          ],
          is_start: true,
        }
      },
      {
        id: '2',
        type: NodeType.AGENT_NODE,
        position: { x: 250, y: 300 },
        data: {
          name: 'Gather Details',
          prompt: "I understand. Can you tell me when your symptoms started and if you've had this issue before?",
          allow_interrupt: true,
          add_global_prompt: true,
          extraction_enabled: true,
          extraction_prompt: "Extract symptom onset and history.",
          extraction_variables: [
            {
              name: 'symptom_onset',
              type: 'string',
              prompt: "When did the symptoms start?"
            },
            {
              name: 'previous_episode',
              type: 'string',
              prompt: "Has this happened before? (Yes/No)"
            }
          ]
        }
      },
      {
        id: '3',
        type: NodeType.END_CALL,
        position: { x: 250, y: 500 },
        data: {
          name: 'Schedule & Close',
          prompt: "Thank you. Based on what you've told me, I'm scheduling you for {{appointment_date}} at {{appointment_time}}. If your symptoms worsen before then, please call us back or go to the ER. Is there anything else I can help with?",
          allow_interrupt: true,
          add_global_prompt: true,
          is_end: true,
        }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        data: {
          condition: '',
          label: ''
        }
      },
      {
        id: 'e2-3',
        source: '2',
        target: '3',
        data: {
          condition: '',
          label: ''
        }
      }
    ],
    templateContextVariables: {
      practice_name: 'ABC Medical Center',
      appointment_date: 'Tomorrow',
      appointment_time: '10:00 AM'
    }
  }
];
