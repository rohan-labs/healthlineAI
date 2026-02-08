"use client";

import {
  ArrowRight,
  BarChart3,
  Bot,
  FileAudio,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneOutgoing,
  Radio,
  Settings2,
  ShieldCheck,
  Target,
  TrendingUp,
  Workflow,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { getCampaignsApiV1CampaignGet,getWorkflowsApiV1WorkflowFetchGet } from '@/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

export default function OverviewPage() {
  const { user, provider } = useAuth();
  const isOSSMode = provider !== 'stack';

  // State for statistics
  const [stats, setStats] = useState({
    workflows: 0,
    campaigns: 0,
    calls: 0,
    files: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch statistics on mount
  useEffect(() => {
    async function fetchStats() {
      try {
        const [workflowsResponse, campaignsResponse] = await Promise.all([
          getWorkflowsApiV1WorkflowFetchGet().catch(() => ({ data: [] })),
          getCampaignsApiV1CampaignGet().catch(() => ({ data: { campaigns: [] } })),
        ]);

        setStats({
          workflows: workflowsResponse.data?.length || 0,
          campaigns: campaignsResponse.data?.campaigns?.length || 0,
          calls: 0, // Can be fetched from usage endpoint if available
          files: 0, // Can be fetched from files endpoint if available
        });
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Create Voice Agent',
      description: 'Build a new AI voice assistant',
      icon: Bot,
      href: '/workflow/create',
      buttonText: 'Create Agent',
    },
    {
      title: 'Launch Campaign',
      description: 'Start a patient outreach campaign',
      icon: Radio,
      href: '/campaigns/new',
      buttonText: 'New Campaign',
    },
    {
      title: 'Configure Models',
      description: 'Set up AI and voice models',
      icon: Settings2,
      href: '/model-configurations',
      buttonText: 'Configure',
    },
    {
      title: 'View Usage',
      description: 'Track calls and analytics',
      icon: BarChart3,
      href: '/usage',
      buttonText: 'View Analytics',
    },
    {
      title: 'Manage Files',
      description: 'Upload audio and documents',
      icon: FileAudio,
      href: '/files',
      buttonText: 'Go to Files',
    },
    {
      title: 'Setup Telephony',
      description: 'Configure phone integrations',
      icon: Phone,
      href: '/telephony-configurations',
      buttonText: 'Setup',
    },
  ];

  const features = [
    {
      title: 'Automated Patient Calls',
      description:
        'Schedule and manage automated patient reminder calls for appointments, prescriptions, and follow-ups',
      icon: PhoneOutgoing,
    },
    {
      title: 'Intelligent Conversation',
      description:
        'Natural language understanding powered by advanced AI models for human-like interactions',
      icon: MessageSquare,
    },
    {
      title: 'Campaign Management',
      description:
        'Organize and track patient outreach campaigns with detailed analytics and reporting',
      icon: Target,
    },
    {
      title: 'Healthcare Compliance',
      description:
        'Built with patient privacy and healthcare regulations in mind for secure communications',
      icon: ShieldCheck,
    },
    {
      title: 'Real-time Analytics',
      description:
        'Monitor call performance, patient engagement, and system usage with live dashboards',
      icon: TrendingUp,
    },
    {
      title: 'Custom Voice Agents',
      description:
        'Visual workflow builder to create tailored voice assistants for specific practice needs',
      icon: Workflow,
    },
  ];

  const gettingStartedSteps = [
    {
      title: 'Configure AI Models',
      description:
        'Set up your preferred speech-to-text, text-to-speech, and language models',
      href: '/model-configurations',
      linkText: 'Model Configurations',
    },
    {
      title: 'Create Your First Voice Agent',
      description: 'Use the visual workflow builder to design conversation flows',
      href: '/workflow/create',
      linkText: 'Workflow Builder',
    },
    {
      title: 'Set Up Telephony',
      description: 'Connect your phone system for inbound and outbound calls',
      href: '/telephony-configurations',
      linkText: 'Telephony Settings',
    },
    {
      title: 'Launch a Campaign',
      description: 'Start reaching out to patients with automated campaigns',
      href: '/campaigns/new',
      linkText: 'Campaign Creator',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold">
                  Welcome to Healthline AI
                </CardTitle>
                <CardDescription className="text-primary-foreground/90 text-lg mt-2">
                  AI-powered voice agents for primary care practices
                </CardDescription>
              </div>
              <PhoneCall className="w-12 h-12 opacity-80 flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-primary-foreground/80 text-base">
              Streamline patient communication, automate routine calls, and enhance
              practice efficiency with intelligent voice assistants designed
              specifically for healthcare professionals and reception teams.
            </p>
          </CardContent>
        </Card>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Voice Agents
              </CardTitle>
              <Bot className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-primary">
                  {stats.workflows}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Active AI assistants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Campaigns
              </CardTitle>
              <Radio className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-primary">
                  {stats.campaigns}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Outreach programs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Calls Handled
              </CardTitle>
              <Phone className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-primary">
                  {stats.calls > 0 ? stats.calls : '-'}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Total conversations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Files Managed
              </CardTitle>
              <FileAudio className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-primary">
                  {stats.files > 0 ? stats.files : '-'}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Audio resources</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.href}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {action.description}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={action.href}>
                      {action.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Capabilities</CardTitle>
            <CardDescription>
              Everything you need to automate patient communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to set up your voice AI system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gettingStartedSteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    <Button asChild variant="link" size="sm" className="p-0 h-auto">
                      <Link href={step.href}>
                        Go to {step.linkText}{' '}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
