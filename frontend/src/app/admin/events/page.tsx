"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { Calendar as CalendarIcon, MapPin, User, Plus, List, Clock, MoreVertical } from "lucide-react";
import EventsLoading from "./loading";
import { EVENT_STATUSES } from "@/lib/constants";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "calendar">("list");
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
  };
  
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    start_date: "",
    end_date: "",
    venue_address: "",
    client_contact: "",
    is_internal: false,
    notes: ""
  });

  const { addToast } = useToast();

  const loadEvents = async () => {
    const { data, error } = await fetchApi("/api/events/");
    if (data) setEvents(data);
    else if (error) addToast(error, "error");
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    const previousEvents = [...events];
    setEvents(events.map(e => e.id === id ? { ...e, status } : e));

    const { error } = await fetchApi(`/api/events/${id}/status`, {
      method: "PUT",
      data: { status }
    });

    if (error) {
      setEvents(previousEvents);
      addToast(error, "error");
    } else {
      addToast(`Event status updated`, "success");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const { data, error } = await fetchApi("/api/events/", {
      method: "POST",
      data: formData
    });

    setActionLoading(false);

    if (error) {
      addToast(error, "error");
    } else {
      addToast("Event created successfully", "success");
      setModalOpen(false);
      setFormData({
        title: "", start_date: "", end_date: "", venue_address: "", client_contact: "", is_internal: false, notes: ""
      });
      loadEvents();
    }
  };

  if (loading && events.length === 0) return <EventsLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Events Schedule</h1>
          <p className="text-muted">Manage all scheduled productions and internal events.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      <div className="bg-surface-2 p-1 rounded-xl w-fit flex gap-1">
        <button 
          onClick={() => setView("list")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "list" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-white"}`}
        >
          <List className="w-4 h-4" /> List
        </button>
        <button 
          onClick={() => setView("calendar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === "calendar" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-white"}`}
        >
          <CalendarIcon className="w-4 h-4" /> Calendar
        </button>
      </div>

      {view === "list" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? events.map(event => (
            <Card key={event.id} className="p-5 flex flex-col hover:border-white/10 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <Badge status={event.status} />
                <div className="relative group">
                  <button className="text-muted hover:text-white p-1 rounded-md">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-surface-2 border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 flex flex-col py-1">
                    {Object.values(EVENT_STATUSES).map(status => (
                      <button 
                        key={status}
                        disabled={event.status === status}
                        onClick={() => handleStatusChange(event.id, status)}
                        className="px-4 py-2 text-sm text-left text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent"
                      >
                        Mark {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{event.title}</h3>
              
              <div className="space-y-2 text-sm mt-auto mb-4">
                <div className="flex items-start gap-2 text-muted">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                  <span>
                    {new Date(event.start_date).toLocaleDateString()}
                    {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString()}`}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-muted">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                  <span className="line-clamp-1">{event.venue_address || "TBD"}</span>
                </div>
                <div className="flex items-start gap-2 text-muted">
                  <User className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                  <span className="line-clamp-1">{event.client_contact || "N/A"}</span>
                </div>
              </div>

              {event.is_internal && (
                <div className="mt-2 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded w-fit uppercase">
                  Internal Event
                </div>
              )}
            </Card>
          )) : (
            <div className="col-span-full text-center py-12 text-muted bg-surface-2/50 rounded-2xl border border-white/5">
              No events scheduled.
            </div>
          )}
        </div>
      ) : (
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={prevMonth}>Prev</Button>
              <Button variant="ghost" size="sm" onClick={nextMonth}>Next</Button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-surface-2 p-2 text-center text-xs font-semibold text-muted uppercase tracking-wider">
                {day}
              </div>
            ))}
            
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-surface min-h-[100px] sm:min-h-[120px] p-2 opacity-50"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth.getMonth() && new Date().getFullYear() === currentMonth.getFullYear();
              
              return (
                <div key={day} className={`bg-surface min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border-t border-white/5 transition-colors hover:bg-surface-2 group ${isToday ? 'bg-accent/5' : ''}`}>
                  <div className={`text-xs sm:text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-accent text-primary' : 'text-muted group-hover:text-white'}`}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayEvents.map(e => (
                      <div key={e.id} className="text-[10px] sm:text-xs px-1.5 py-1 rounded bg-white/5 text-white/90 truncate border-l-2 border-accent" title={e.title}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Event">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Event Title *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Start Date *</label>
              <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">End Date</label>
              <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Venue Address *</label>
            <input type="text" value={formData.venue_address} onChange={e => setFormData({...formData, venue_address: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Client Contact</label>
            <input type="text" value={formData.client_contact} onChange={e => setFormData({...formData, client_contact: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent resize-none h-20" />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input type="checkbox" id="internal" checked={formData.is_internal} onChange={e => setFormData({...formData, is_internal: e.target.checked})} className="w-4 h-4 accent-accent" />
            <label htmlFor="internal" className="text-sm text-white">This is an internal company event</label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={actionLoading}>Create Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
