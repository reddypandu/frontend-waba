import { useState, useEffect } from 'react';
import { Inbox, GitMerge, Megaphone, PhoneCall, Search, MoreVertical, Paperclip, Mic, Send, Bot, Users, Activity, FileText, Smartphone, LayoutGrid, Settings, ChevronDown, Plus, MessageSquare } from 'lucide-react';

const tabs = [
  { id: 'inbox', num: '01', label: 'Smart Inbox', icon: Inbox },
  { id: 'flow', num: '02', label: 'Flow Builder', icon: GitMerge },
  { id: 'campaigns', num: '03', label: 'Campaigns & Webhooks', icon: Megaphone },
  { id: 'voice', num: '04', label: 'AI Voice Calling', icon: PhoneCall },
];

const SmartInboxMockup = () => (
  <div className="overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 w-full min-w-0">
    <div className="relative min-w-[800px] w-full max-w-4xl mx-auto mt-4 animate-fade-in scale-[0.85] md:scale-100 origin-top-left md:origin-top">
    {/* Floating Badges */}
    <div className="hidden md:flex absolute -left-12 top-24 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 items-center gap-2 z-10 animate-float">
      <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center">
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      </div>
      <span className="text-sm font-semibold text-slate-700">WhatsApp API</span>
    </div>
    <div className="hidden md:flex absolute -left-8 top-52 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 items-center gap-2 z-10 animate-float" style={{ animationDelay: '1s' }}>
      <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center">
        <LayoutGrid className="w-3 h-3 text-white" />
      </div>
      <span className="text-sm font-semibold text-slate-700">WhatsApp QR</span>
    </div>
    
    <div className="hidden md:flex absolute -right-6 top-32 bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 items-center gap-2 z-10 animate-float" style={{ animationDelay: '0.5s' }}>
      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
      </div>
      <span className="text-sm font-semibold text-slate-700">Telegram</span>
    </div>

    {/* Main Mockup Window */}
    <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      {/* Window Header */}
      <div className="h-12 bg-slate-100/50 border-b border-slate-200 flex items-center px-4 shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        </div>
        <div className="mx-auto flex items-center gap-2 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-200 text-xs text-slate-500 w-64 justify-center">
          <Search className="w-3 h-3" />
          <span>inbox</span>
        </div>
      </div>
      
      {/* Window Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* App Sidebar (Narrow) */}
        <div className="w-14 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 gap-6 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-green-500 text-white flex items-center justify-center font-bold">W</div>
          <div className="flex flex-col gap-4 text-slate-400">
            <MessageSquare className="w-5 h-5 text-brand-green-500" />
            <Users className="w-5 h-5" />
            <Activity className="w-5 h-5" />
            <FileText className="w-5 h-5" />
            <Settings className="w-5 h-5 mt-auto" />
          </div>
        </div>

        {/* Chat List */}
        <div className="w-72 border-r border-slate-200 flex flex-col shrink-0 bg-white">
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Inbox</h3>
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input type="text" placeholder="Search..." className="w-full bg-slate-100 rounded-lg pl-9 pr-3 py-2 text-sm border-none focus:ring-0" />
            </div>
            <div className="flex gap-2 text-xs font-medium">
              <span className="px-3 py-1 bg-brand-green-50 text-brand-green-700 rounded-full">All</span>
              <span className="px-3 py-1 text-slate-500 hover:bg-slate-50 rounded-full cursor-pointer">Unread</span>
              <span className="px-3 py-1 text-slate-500 hover:bg-slate-50 rounded-full cursor-pointer">Read</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Active Chat Item */}
            <div className="p-3 border-b border-slate-100 bg-brand-green-50/30 flex gap-3 cursor-pointer relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brand-green-500">
              <div className="w-10 h-10 rounded-full bg-brand-green-100 flex items-center justify-center text-brand-green-700 font-semibold shrink-0">C</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-semibold text-sm text-slate-800 truncate">Codeyon</span>
                  <span className="text-[10px] text-slate-400">Friday</span>
                </div>
                <p className="text-xs text-slate-500 truncate">ola</p>
                <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded mt-1 inline-block">WhatsApp</span>
              </div>
            </div>
            
            {/* Other Chat Items */}
            {[
              { name: "+919600000000", msg: "hi man", color: "bg-red-500", label: "Meta" },
              { name: "Codeyon", msg: "Voice message", color: "bg-emerald-600", label: "Meta" },
              { name: "+19690000000", msg: "Class", color: "bg-orange-500", label: "WhatsApp" },
              { name: "+8584177993", msg: "Thanks for choosing support", color: "bg-teal-500", label: "Telegram" },
            ].map((chat, i) => (
              <div key={i} className="p-3 border-b border-slate-100 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-full ${chat.color} text-white flex items-center justify-center font-semibold shrink-0 text-sm`}>
                  {chat.name.substring(0,1).replace('+','H')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-medium text-sm text-slate-700 truncate">{chat.name}</span>
                    <span className="text-[10px] text-slate-400">02/24/26</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{chat.msg}</p>
                  <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded mt-1 inline-block">{chat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50/50">
          <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-green-100 text-brand-green-700 flex items-center justify-center font-semibold">C</div>
              <div>
                <h2 className="font-semibold text-sm text-slate-800">Codeyon</h2>
                <p className="text-xs text-slate-400">+916430088300</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Search className="w-4 h-4 cursor-pointer" />
              <MoreVertical className="w-4 h-4 cursor-pointer" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <div className="text-center text-[10px] text-slate-400 my-2">March 27, 2026</div>
            
            {/* Incoming Bubble */}
            <div className="flex gap-3 max-w-[80%]">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                <p className="text-sm text-slate-700">ola</p>
                <div className="text-[10px] text-slate-400 text-right mt-1">6:50 PM</div>
              </div>
            </div>
            
            {/* Outgoing Bubble */}
            <div className="flex gap-3 max-w-[80%] self-end">
              <div className="bg-brand-green-500 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm">
                <p className="text-sm">ola</p>
                <div className="text-[10px] text-brand-green-100 text-right mt-1 flex items-center justify-end gap-1">
                  6:50 PM
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <div className="bg-slate-100 rounded-xl flex items-center px-4 py-2">
              <Paperclip className="w-5 h-5 text-slate-400 cursor-pointer" />
              <input type="text" placeholder="Type / for quick replies..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4" />
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-slate-400 cursor-pointer hover:text-brand-green-500 transition-colors" />
                <Mic className="w-5 h-5 text-slate-400 cursor-pointer" />
                <div className="w-8 h-8 rounded-full bg-brand-green-500 flex items-center justify-center cursor-pointer hover:bg-brand-green-600 transition-colors shadow-sm">
                  <Send className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="h-12 border-b border-slate-100 flex items-center px-4 justify-between">
            <span className="font-semibold text-sm text-slate-700">Chat Info</span>
            <span className="text-slate-400 cursor-pointer text-lg leading-none">&times;</span>
          </div>
          <div className="p-6 flex flex-col items-center border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-brand-green-100 text-brand-green-700 flex items-center justify-center text-xl font-bold mb-3 border-2 border-brand-green-500 shadow-sm">C</div>
            <h3 className="font-semibold text-slate-800">Codeyon</h3>
            <p className="text-xs text-slate-500">+918430088300</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 text-sm">
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold tracking-wide uppercase">
                <span>Contact Info</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Name</span>
                <span className="text-slate-800 text-xs font-medium">Codeyon</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-xs">Mobile Number</span>
                <span className="text-slate-800 text-xs font-medium">+918430088300</span>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-500 font-semibold tracking-wide uppercase">
                <span>Labels</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] bg-orange-50 text-orange-600 border border-orange-100">Important</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 border border-blue-100">new tag</span>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />
            
            <div className="space-y-3">
               <div className="flex justify-between items-center text-xs text-slate-500 font-semibold tracking-wide uppercase">
                <span>Assigned Agent</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold">J</div>
                <span className="text-xs font-medium text-slate-700">John</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</div>
);


const FlowBuilderMockup = () => (
  <div className="overflow-x-auto no-scrollbar -mx-6 px-6 md:mx-0 md:px-0 w-full min-w-0">
    <div className="relative min-w-[800px] w-full max-w-4xl mx-auto mt-4 animate-fade-in scale-[0.85] md:scale-100 origin-top-left md:origin-top">
      <div className="bg-slate-100 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden flex flex-col h-[500px] relative">
      {/* Window Header */}
      <div className="h-12 bg-slate-100/50 border-b border-slate-200 flex items-center px-4 shrink-0 absolute top-0 w-full z-10 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        </div>
        <div className="ml-6 flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span className="text-slate-400">automation-flows</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700">Welcome Bot</span>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 w-full h-full bg-[#f8f9fa] relative pt-12 overflow-hidden dot-grid">
        
        {/* Node 1: Initial Node */}
        <div className="absolute left-[15%] top-[30%] w-64 bg-white rounded-xl shadow-md border border-brand-green-200 overflow-hidden">
          <div className="bg-brand-green-50 px-4 py-2 border-b border-brand-green-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-brand-green-600" />
              <span className="text-xs font-semibold text-brand-green-800">Initial Node</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold mb-1 block">Source</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 flex justify-between items-center">
                Chatbot <ChevronDown className="w-3 h-3" />
              </div>
            </div>
            <div className="pt-2">
              <span className="text-[10px] text-brand-green-600 font-medium bg-brand-green-50 px-2 py-1 rounded border border-brand-green-100 inline-block mb-1">Available Variables</span>
              <div className="flex gap-1 text-[9px] text-slate-500 flex-wrap mt-1">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">{"{{sender.name}}"}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">{"{{message}}"}</span>
              </div>
            </div>
          </div>
          {/* Connector Dot */}
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-green-400 border-2 border-white shadow-sm" />
        </div>

        {/* SVG Connector Line 1 */}
        <svg className="absolute left-[calc(15%+16rem)] top-[30%] w-24 h-12 overflow-visible" style={{ transform: 'translateY(50%)' }}>
          <path d="M 0 0 C 40 0, 40 40, 96 40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
        </svg>

        {/* Node 2: Condition Router */}
        <div className="absolute left-[calc(15%+22rem)] top-[calc(30%+2.5rem)] w-64 bg-white rounded-xl shadow-md border border-orange-200 overflow-hidden">
          {/* Connector Dot (Input) */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm z-10" />
          
          <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-800">Condition Router</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-700">Custom Input</span>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600">Contains</div>
                <div className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600">hello</div>
              </div>
            </div>
            <button className="w-full py-1.5 border border-dashed border-slate-300 rounded-md text-[10px] text-slate-500 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Add Condition
            </button>
          </div>
          {/* Connector Dot (Output) */}
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-orange-400 border-2 border-white shadow-sm" />
        </div>

        {/* SVG Connector Line 2 */}
        <svg className="absolute left-[calc(15%+38rem)] top-[calc(30%+2.5rem)] w-24 h-12 overflow-visible" style={{ transform: 'translateY(50%)' }}>
          <path d="M 0 0 C 40 0, 40 0, 96 0" fill="none" stroke="#94a3b8" strokeWidth="2" />
        </svg>

        {/* Node 3: Send Message */}
        <div className="absolute left-[calc(15%+44rem)] top-[calc(30%+2.5rem)] w-64 bg-white rounded-xl shadow-md border border-blue-200 overflow-hidden">
          {/* Connector Dot (Input) */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm z-10" />
          
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">Send Message</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
             <div>
              <label className="text-[10px] text-slate-500 uppercase font-semibold mb-1 block">Message Type</label>
              <div className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 flex justify-between items-center">
                Text Message <ChevronDown className="w-3 h-3" />
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-md p-2 text-xs text-slate-600 min-h-[60px]">
              Welcome to my company! How can we help you today?
            </div>
          </div>
        </div>

        {/* Right Sidebar (Node Menu) */}
        <div className="absolute right-4 top-16 bottom-4 w-64 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden z-20">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-800">Node Menu</span>
            <span className="text-slate-400 cursor-pointer">&times;</span>
          </div>
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-slate-400" />
              <input type="text" placeholder="Search nodes..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-brand-green-500" />
            </div>
            <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
              <span className="px-2 py-0.5 bg-brand-green-500 text-white text-[10px] rounded-full font-medium shrink-0">All</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] rounded-full font-medium shrink-0 cursor-pointer transition-colors">Message</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] rounded-full font-medium shrink-0 cursor-pointer transition-colors">Request</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] rounded-full font-medium shrink-0 cursor-pointer transition-colors">Logic</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Node Items */}
            {[
              { icon: MessageSquare, label: "Send Message", desc: "Send text, media or interactive", color: "text-blue-500", dot: "bg-blue-500" },
              { icon: GitMerge, label: "Condition", desc: "Route based on conditions", color: "text-orange-500", dot: "bg-orange-500" },
              { icon: FileText, label: "Response Saver", desc: "Save response to variables", color: "text-indigo-500", dot: "bg-indigo-500" },
              { icon: Activity, label: "Make Request", desc: "Call external APIs", color: "text-purple-500", dot: "bg-purple-500" },
              { icon: Users, label: "Agent Transfer", desc: "Hand off to human agent", color: "text-brand-green-500", dot: "bg-brand-green-500" },
              { icon: PhoneCall, label: "AI Voice Call", desc: "Trigger voice AI assistant", color: "text-rose-500", dot: "bg-rose-500" },
            ].map((node, i) => (
              <div key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-grab transition-colors border border-transparent hover:border-slate-100">
                <node.icon className={`w-4 h-4 mt-0.5 ${node.color}`} />
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-slate-800">{node.label}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{node.desc}</p>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${node.dot} mt-1.5`} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
</div>
);

const CampaignsMockup = () => (
  <div className="relative w-full min-w-0 max-w-4xl mx-auto mt-4 animate-fade-in scale-[0.85] md:scale-90 origin-top flex flex-col md:flex-row gap-6 justify-center">
    
    {/* Card 1 */}
    <div className="flex-1 bg-white rounded-3xl p-8 shadow-card border border-slate-100 hover:shadow-elevated transition-all duration-300 card-hover">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
        <Megaphone className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">Bulk Broadcasting</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        Create approved templates, schedule campaigns, personalize variables and track delivery in real time.
      </p>
      <div className="flex items-center gap-2 text-sm font-bold text-orange-500 mt-auto">
        <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">✓</div>
        94% read rate
      </div>
    </div>

    {/* Card 2 */}
    <div className="flex-1 bg-white rounded-3xl p-8 shadow-card border border-slate-100 hover:shadow-elevated transition-all duration-300 card-hover">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6">
        <Activity className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">Webhook Automation</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        Receive events from any app, trigger flows, call APIs and sync data with your CRM or internal tools.
      </p>
      <div className="flex items-center gap-2 text-sm font-bold text-blue-500 mt-auto">
        <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">✓</div>
        Real-time events
      </div>
    </div>

    {/* Card 3 */}
    <div className="flex-1 bg-white rounded-3xl p-8 shadow-card border border-slate-100 hover:shadow-elevated transition-all duration-300 card-hover">
      <div className="w-12 h-12 rounded-2xl bg-brand-green-50 text-brand-green-500 flex items-center justify-center mb-6">
        <Send className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">WhatsApp Forms</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        Collect leads through native WhatsApp forms and push responses directly into automations.
      </p>
      <div className="flex items-center gap-2 text-sm font-bold text-brand-green-500 mt-auto">
        <div className="w-4 h-4 rounded-full bg-brand-green-100 flex items-center justify-center">✓</div>
        Lead capture
      </div>
    </div>

  </div>
);

const VoiceCallingMockup = () => (
  <div className="relative w-full min-w-0 max-w-4xl mx-auto mt-4 animate-fade-in scale-[0.85] md:scale-90 origin-top flex flex-col md:flex-row items-center gap-12 lg:gap-24">
    
    {/* Left: Features List */}
    <div className="flex-1 space-y-4 w-full">
      {[
        { icon: Bot, title: "Autonomous voice agent", desc: "Handles calls 24/7 using your trained knowledge base — no human agent needed.", color: "text-emerald-600", bg: "bg-emerald-100" },
        { icon: Activity, title: "Sub-second response", desc: "Replies in under 1.2s, faster than any human support team.", color: "text-blue-600", bg: "bg-blue-100" },
        { icon: FileText, title: "Live transcription", desc: "Every call is transcribed and synced to your CRM in real time.", color: "text-orange-600", bg: "bg-orange-100" },
        { icon: GitMerge, title: "Smart call routing", desc: "Routes complex queries to human agents and handles the rest automatically.", color: "text-purple-600", bg: "bg-purple-100" },
      ].map((feature, idx) => (
        <div key={idx} className="bg-slate-50 rounded-2xl p-5 flex gap-4 items-start border border-slate-100 hover:bg-white hover:shadow-md transition-all">
          <div className={`w-10 h-10 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center shrink-0`}>
            <feature.icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">{feature.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
          </div>
        </div>
      ))}
    </div>

    {/* Right: Phone Mockup */}
    <div className="flex-1 flex justify-center w-full">
      <div className="relative w-[300px] h-[620px] bg-[#0A1A12] rounded-[40px] border-[8px] border-slate-900 shadow-2xl overflow-hidden shadow-brand-green-500/20">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
          <div className="w-24 h-6 bg-slate-900 rounded-b-xl"></div>
        </div>

        {/* WhatsApp Call UI */}
        <div className="absolute inset-0 pt-12 pb-8 px-6 flex flex-col z-10">
          
          <div className="flex justify-between items-center text-white/80 text-xs mb-8 font-medium">
            <span>9:41</span>
            <div className="flex gap-1.5 items-center">
              <svg className="w-3 h-3 text-brand-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              <span>WhatsApp • Encrypted</span>
            </div>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center pb-12">
            
            {/* Animated Avatar */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-brand-green-500/20 rounded-full animate-ping scale-150"></div>
              <div className="absolute inset-0 bg-brand-green-500/40 rounded-full animate-pulse scale-125"></div>
              <div className="relative w-20 h-20 rounded-full bg-brand-green-500 flex items-center justify-center shadow-lg shadow-brand-green-500/40 z-10">
                <Bot className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-white font-bold text-xl mb-1">AI Assistant</h2>
            <div className="flex items-center gap-2 text-brand-green-400 text-sm font-medium mb-8">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-brand-green-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></div>
                <div className="w-1 h-1 bg-brand-green-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></div>
                <div className="w-1 h-1 bg-brand-green-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></div>
              </div>
              Speaking...
              <span className="text-white/60 ml-1">00:04</span>
            </div>

            {/* Audio Visualizer */}
            <div className="flex items-center gap-1 h-12 mb-12">
               {[...Array(15)].map((_, i) => (
                 <div key={i} className="w-1 bg-brand-green-400 rounded-full" 
                      style={{ 
                        height: `${Math.max(20, Math.random() * 100)}%`,
                        animation: `pulse-glow ${1 + Math.random()}s infinite alternate`
                      }} />
               ))}
            </div>

            {/* Live Transcript Box */}
            <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-sm mt-4">
              <div className="text-[10px] text-brand-green-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-brand-green-400 rounded-full animate-pulse" />
                Live Transcript
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="text-white/50 text-xs mt-0.5">You</span>
                  <p className="text-white/90 text-sm">Hi, I need help with my order.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-brand-green-400 text-xs mt-0.5 font-medium">AI</span>
                  <p className="text-white/90 text-sm">Hi! Order #4821 is out for delivery — arriving by 3 PM today.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Call Controls */}
          <div className="flex justify-between items-center px-4 mt-auto">
             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
               <Mic className="w-5 h-5" />
             </div>
             <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"/></svg>
             </div>
             <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
             </div>
          </div>
          
        </div>
      </div>
    </div>

  </div>
);


const FeatureShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState('inbox');

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(current => {
        const currentIndex = tabs.findIndex(t => t.id === current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].id;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const getHeading = () => {
    switch(activeTab) {
      case 'inbox': return <><span className="text-slate-800">Every conversation,</span> <span className="text-brand-green-500">one place</span></>;
      case 'flow': return <><span className="text-slate-800">Build automations</span> <span className="text-brand-green-500">without code</span></>;
      case 'campaigns': return <><span className="text-slate-800">Automate outreach</span> <span className="text-orange-500">and integrations</span></>;
      case 'voice': return <><span className="text-slate-800">AI that answers</span> <span className="text-blue-500">every whatsapp call</span></>;
      default: return null;
    }
  };

  const getSubheading = () => {
    switch(activeTab) {
      case 'inbox': return "Assign agents, add labels, write notes, filter conversations and reply — all from a single unified inbox. Works with WhatsApp API, QR, and Telegram.";
      case 'flow': return "Drag nodes, connect steps, and launch chatbot flows in minutes. Automate WhatsApp and Telegram responses, route conversations, and trigger webhooks — zero developer needed.";
      case 'campaigns': return "Send bulk campaigns, collect WhatsApp form leads, trigger webhooks and connect your workspace to external tools in real time.";
      case 'voice': return "Deploy a voice AI agent that handles WhatsApp calls around the clock — qualifying leads, resolving support queries, and booking meetings automatically.";
      default: return null;
    }
  };

  return (
    <section className="py-12 bg-slate-50 relative overflow-hidden font-sans">
      
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Tabs */}
        <div className="overflow-x-auto no-scrollbar mb-8 pb-2 -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex md:justify-center w-max min-w-full">
            <div className="bg-white rounded-full p-2.5 shadow-sm border border-slate-200 inline-flex gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-brand-green-50 text-brand-green-700 shadow-sm border border-brand-green-100' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm text-brand-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    <tab.icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold mr-1">{tab.num}</span>
                  {tab.label}
                </button>
              );
            })}
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="text-center max-w-3xl mx-auto mb-10 min-h-[160px] md:min-h-[120px] flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 transition-all animate-fade-in" key={`h-${activeTab}`}>
            {getHeading()}
          </h2>
          <p className="text-slate-500 text-base md:text-lg animate-fade-in" key={`p-${activeTab}`}>
            {getSubheading()}
          </p>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px] flex justify-center w-full min-w-0 overflow-hidden">
          {activeTab === 'inbox' && <SmartInboxMockup />}
          {activeTab === 'flow' && <FlowBuilderMockup />}
          {activeTab === 'campaigns' && <CampaignsMockup />}
          {activeTab === 'voice' && <VoiceCallingMockup />}
        </div>

      </div>
    </section>
  );
};

export default FeatureShowcaseSection;
