import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, Mail, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from '@/lib/api'; // Make sure this path is correct

export default function BookingFlow() {
  const { workflowId, conversationId } = useParams();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  
  useEffect(() => {
    if (date) {
      fetchSlots(date);
    }
  }, [date]);

  const fetchSlots = async (selectedDate) => {
    try {
      const res = await fetch(`/api/business/slots/${workflowId}?date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async () => {
    if (!date || !selectedTime || !name || !email) {
      toast.error("Please fill all fields");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/business/book/${workflowId}/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time: selectedTime, name, email })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Booking confirmed!");
        setTransactionId(data.transactionId);
        setStep(3); // Success Screen
      } else {
        toast.error(data.error || "Failed to book slot");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 ring-1 ring-slate-200">
        <CardHeader className="bg-white border-b border-slate-100 rounded-t-xl pb-6">
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            Book a Meeting
          </CardTitle>
          <CardDescription className="text-center text-slate-500">
            Select a date and time that works for you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 bg-white rounded-b-xl">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Select Date
                </label>
                <Input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              
              {date && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Available Slots
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {slots.length > 0 ? (
                      slots.map(slot => (
                        <button
                          key={slot.time}
                          disabled={slot.status === 'booked'}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            slot.status === 'booked'
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-70'
                              : selectedTime === slot.time 
                                ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]' 
                                : 'bg-slate-50 text-slate-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-200'
                          }`}
                        >
                          {slot.time}
                          {slot.status === 'booked' && <span className="block text-[10px] mt-1 text-red-400">Booked</span>}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-3 text-center text-sm text-slate-500 py-4 bg-slate-50 rounded-lg">
                        Select a date to view slots
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                className="w-full py-6 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all"
                disabled={!date || !selectedTime}
                onClick={() => setStep(2)}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-3 text-blue-800 font-medium mb-1">
                  <Calendar className="w-5 h-5" />
                  {date}
                </div>
                <div className="flex items-center gap-3 text-blue-800 font-medium">
                  <Clock className="w-5 h-5" />
                  {selectedTime}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Full Name
                  </label>
                  <Input 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 border-slate-200 rounded-lg focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email Address
                  </label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 border-slate-200 rounded-lg focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="w-1/3 py-6 rounded-xl"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button 
                  className="w-2/3 py-6 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                  disabled={loading || !name || !email}
                  onClick={handleBook}
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 py-8 animate-in zoom-in duration-500">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Booking Confirmed!</h2>
              <p className="text-slate-600 px-4">
                Your meeting has been scheduled for<br/>
                <span className="font-semibold text-slate-800">{date} at {selectedTime}</span>
              </p>
              <div className="pt-6">
                <p className="text-sm text-slate-500 mb-4">Please return to WhatsApp to continue.</p>
                <Button 
                  className="w-full py-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white"
                  onClick={() => window.close()}
                >
                  Close Window
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
