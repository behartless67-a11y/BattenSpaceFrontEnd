"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ExternalLink, Wrench, Users, FileText, BarChart, Database } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: "wrench" | "users" | "file" | "chart" | "database" | "link";
  category: string;
}

// Configure your tools here
const tools: Tool[] = [
  {
    id: "1",
    name: "Staff Directory",
    description: "Search and view contact information for Batten School staff",
    url: "https://thebattenspace.org/staff-directory",
    icon: "users",
    category: "Resources",
  },
  {
    id: "2",
    name: "Batten Intranet",
    description: "Access internal resources and information",
    url: "https://thebattenspace.org/intranet",
    icon: "file",
    category: "Resources",
  },
  {
    id: "3",
    name: "Analytics Dashboard",
    description: "View metrics and analytics for school operations",
    url: "#",
    icon: "chart",
    category: "Analytics",
  },
  {
    id: "4",
    name: "Database Tools",
    description: "Access database management and reporting tools",
    url: "#",
    icon: "database",
    category: "Tools",
  },
  {
    id: "5",
    name: "Admin Portal",
    description: "Administrative tools and settings",
    url: "#",
    icon: "wrench",
    category: "Administration",
  },
  // Add more tools as needed
];

function getIcon(iconName: string) {
  const iconClass = "w-8 h-8";
  switch (iconName) {
    case "wrench":
      return <Wrench className={iconClass} />;
    case "users":
      return <Users className={iconClass} />;
    case "file":
      return <FileText className={iconClass} />;
    case "chart":
      return <BarChart className={iconClass} />;
    case "database":
      return <Database className={iconClass} />;
    default:
      return <ExternalLink className={iconClass} />;
  }
}

export default function Home() {
  const categories = Array.from(new Set(tools.map((tool) => tool.category)));

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col relative">
        {/* Background Image */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: 'url(/garrett-hall-sunset.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            filter: 'grayscale(100%)',
          }}
        ></div>
        {/* Background Overlay */}
        <div className="fixed inset-0 bg-white/85 -z-10"></div>

        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-4 text-uva-navy animate-fade-in-up">
              Welcome to The Batten Space
            </h1>
            <div className="w-24 h-1 bg-uva-orange mx-auto mb-6 animate-fade-in-up animation-delay-200"></div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              Your central hub for digital tools and resources at the Frank Batten School of
              Leadership and Public Policy
            </p>
          </div>

          {/* Tools Grid */}
          {categories.map((category, idx) => {
            const categoryTools = tools.filter((tool) => tool.category === category);
            return (
              <div key={category} className="mb-12">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-uva-navy mb-2">{category}</h2>
                  <div className="w-16 h-1 bg-uva-orange"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryTools.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-uva-orange"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-uva-navy group-hover:bg-uva-orange transition-colors duration-300 flex items-center justify-center text-white">
                            {getIcon(tool.icon)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-uva-navy mb-2 group-hover:text-uva-orange transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-uva-orange font-semibold text-sm">
                          <span className="group-hover:translate-x-1 transition-transform">
                            Open Tool
                          </span>
                          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                      {/* Hover Effect Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-uva-orange/5 to-uva-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Quick Links Section */}
          <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border-t-4 border-uva-orange">
            <h2 className="text-2xl font-bold text-uva-navy mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="https://batten.virginia.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-uva-navy hover:text-uva-orange transition-colors font-semibold"
              >
                Batten School Website →
              </a>
              <a
                href="https://virginia.edu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-uva-navy hover:text-uva-orange transition-colors font-semibold"
              >
                UVA Website →
              </a>
              <a
                href="mailto:bh4hb@virginia.edu"
                className="text-uva-navy hover:text-uva-orange transition-colors font-semibold"
              >
                IT Support →
              </a>
              <a
                href="#"
                className="text-uva-navy hover:text-uva-orange transition-colors font-semibold"
              >
                Help Documentation →
              </a>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
}
