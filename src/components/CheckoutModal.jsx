import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { playClick, playSuccess } from '../utils/audioSynth';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Check, CreditCard, Truck, FileText, Lock, ArrowRight, Smartphone } from 'lucide-react';
import { generateTaxInvoiceHTML } from '../services/emailInvoiceService';

export const CheckoutModal = () => {
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    subtotalAED,
    discountAmountAED,
    shippingCostAED,
    vatAED,
    totalAED,
    createRealTimeOrder
  } = useCart();

  const [step, setStep] = useState(1); // 1: Info, 2: Delivery, 3: Payment, 4: Confirmed
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD', 'TABBY', 'COD', 'TELR'
  const [formData, setFormData] = useState({
    fullName: 'Sultan Al-Maktoum',
    email: 'sultan.rider@cyberride.ae',
    phone: '+971 50 123 4567',
    emirate: 'Dubai',
    address: 'Building 4, Dubai Marina Promenade, Apartment 1402',
    notes: 'Please call before delivery'
  });

  const [orderId, setOrderId] = useState('');
  const [lastCompletedOrder, setLastCompletedOrder] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleCompleteOrder = (e) => {
    e.preventDefault();
    playSuccess();
    const generatedId = 'CR-DXB-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(generatedId);

    // Build real-time order record
    const orderItemsSummary = cart.map(i => `${i.product.name} (x${i.quantity})`).join(', ') || 'CYBERRIDE NEXUS LED BACKPACK (x1)';
    const firstItem = cart[0] || {};
    const finalTotalAED = totalAED > 0 ? totalAED : 349;
    
    const newOrderRecord = {
      id: generatedId,
      customer: formData.fullName || 'Sheikh Rider',
      email: formData.email || 'rider@dubai.ae',
      phone: formData.phone || '+971 50 123 4567',
      items: orderItemsSummary,
      color: firstItem.selectedColor || 'STEALTH BLACK',
      led: firstItem.selectedLed || 'RED PULSE EYES',
      total: finalTotalAED,
      payment: paymentMethod === 'COD' ? 'CASH ON DELIVERY' : paymentMethod === 'TABBY' ? 'TABBY BNPL' : 'STRIPE (VISA)',
      status: 'PENDING DISPATCH',
      zone: `${formData.emirate} Express`,
      address: formData.address || 'Dubai Marina, UAE',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      tracking: `ARM-DXB-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setLastCompletedOrder(newOrderRecord);
    createRealTimeOrder(newOrderRecord);

    setStep(4);
    clearCart();

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0A0A0A] border border-[#E10600]/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E10600]" />
            <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
              CYBERRIDE DUBAI EXPRESS CHECKOUT
            </h3>
          </div>
          {step < 4 && (
            <button
              onClick={() => {
                playClick();
                setIsCheckoutOpen(false);
              }}
              className="p-1.5 rounded bg-[#141414] border border-[#2A2A2A] text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Steps Progress Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between gap-2 mb-8 bg-[#141414] p-3 rounded-xl border border-[#2A2A2A] text-xs font-mono">
            {[
              { num: 1, label: 'SHIPPING INFO' },
              { num: 2, label: 'DELIVERY' },
              { num: 3, label: 'PAYMENT' }
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 ${step >= s.num ? 'text-[#FF1A1A] font-bold' : 'text-gray-500'}`}
              >
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center border ${
                  step >= s.num ? 'bg-[#E10600] text-white border-[#FF1A1A]' : 'bg-[#0A0A0A] border-gray-700'
                }`}>
                  {s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: Customer Contact & Dubai Shipping Info */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-gray-400 uppercase">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white focus:border-[#E10600] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 uppercase">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white focus:border-[#E10600] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-gray-400 uppercase">PHONE NUMBER (UAE +971)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white focus:border-[#E10600] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 uppercase">EMIRATE / LOCATION</label>
                <select
                  value={formData.emirate}
                  onChange={(e) => setFormData({ ...formData, emirate: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white focus:border-[#E10600] focus:outline-none"
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Fujairah">Fujairah</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-400 uppercase">STREET ADDRESS / BUILDING / SUITE</label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full mt-1 px-4 py-3 rounded-lg bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-white focus:border-[#E10600] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="cyber-button-primary w-full py-4 rounded-xl text-xs font-mono font-bold mt-2 flex items-center justify-center gap-2"
            >
              <span>PROCEED TO DELIVERY METHOD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Delivery Speed */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="text-xs font-mono text-gray-400 uppercase mb-2">SELECT DUBAI / UAE COURIER SPEED</div>
            
            <div className="p-4 rounded-xl bg-[#141414] border border-[#E10600] flex justify-between items-center">
              <div>
                <div className="font-display font-bold text-sm text-white">DUBAI SAME-DAY EXPRESS</div>
                <div className="text-xs font-mono text-gray-400">Order before 2 PM GST for same-evening delivery</div>
              </div>
              <div className="font-mono font-bold text-sm text-[#FF1A1A]">
                {shippingCostAED === 0 ? 'FREE' : `${shippingCostAED} AED`}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-gray-300"
              >
                BACK
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="cyber-button-primary flex-1 py-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2"
              >
                <span>PROCEED TO PAYMENT GATEWAY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: UAE Payment Selection */}
        {step === 3 && (
          <form onSubmit={handleCompleteOrder} className="flex flex-col gap-4">
            <div className="text-xs font-mono text-gray-400 uppercase">SELECT PAYMENT METHOD</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'CARD', title: 'CREDIT / DEBIT CARD', desc: 'Visa & Mastercard (Stripe 256-bit SSL)' },
                { id: 'TABBY', title: 'TABBY / TAMARA BNPL', desc: 'Pay 4 interest-free payments of 324.75 AED/mo' },
                { id: 'TELR', title: 'TELR UAE DEBIT', desc: 'UAE Local Direct Banking Gateway' },
                { id: 'COD', title: 'CASH ON DELIVERY (COD)', desc: 'Pay Cash to courier (+20 AED Handling Fee)' }
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    paymentMethod === pm.id
                      ? 'bg-[#1F1F1F] border-[#E10600] shadow-[0_0_15px_rgba(225,6,0,0.4)]'
                      : 'bg-[#141414] border-[#2A2A2A] hover:border-gray-600'
                  }`}
                >
                  <div className="font-display font-bold text-xs text-white">{pm.title}</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-1">{pm.desc}</div>
                </button>
              ))}
            </div>

            {/* Total Order Summary */}
            <div className="bg-[#141414] p-4 rounded-xl border border-[#2A2A2A] flex flex-col gap-2 text-xs font-mono text-gray-300 mt-2">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span className="text-white">{subtotalAED.toLocaleString()} AED</span>
              </div>
              <div className="flex justify-between">
                <span>SHIPPING:</span>
                <span className="text-white">{shippingCostAED === 0 ? 'FREE' : `${shippingCostAED} AED`}</span>
              </div>
              <div className="flex justify-between">
                <span>5% UAE VAT:</span>
                <span className="text-white">{vatAED.toLocaleString()} AED</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#FF1A1A] pt-2 border-t border-[#2A2A2A]">
                <span>TOTAL DUE:</span>
                <span>{totalAED.toLocaleString()} AED</span>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl bg-[#141414] border border-[#2A2A2A] text-xs font-mono text-gray-300"
              >
                BACK
              </button>
              <button
                type="submit"
                className="cyber-button-primary flex-1 py-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(225,6,0,0.6)]"
              >
                <Lock className="w-4 h-4" />
                <span>CONFIRM ORDER — {totalAED.toLocaleString()} AED</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Transmission Complete Screen */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#E10600] flex items-center justify-center text-white shadow-[0_0_30px_#FF1A1A] mb-4 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="text-xs font-mono text-[#FF1A1A] font-bold uppercase tracking-widest mb-1">
              TRANSMISSION COMPLETE :: DUBAI HUB DISPATCHED
            </div>

            <h3 className="font-display font-black text-2xl text-white uppercase">
              ORDER CONFIRMED #{orderId}
            </h3>

            <p className="text-xs font-mono text-gray-300 mt-2 max-w-md">
              Thank you, {formData.fullName}! Your order has been registered for Dubai Same-Day Express dispatch. A confirmation receipt has been sent to {formData.email}.
            </p>

            <div className="my-6 p-4 rounded-xl bg-[#141414] border border-[#2A2A2A] w-full max-w-md text-xs font-mono text-left text-gray-300 flex flex-col gap-2">
              <div>📄 <strong>ORDER ID:</strong> {orderId}</div>
              <div>📍 <strong>DELIVERY TO:</strong> {formData.address}, {formData.emirate}, UAE</div>
              <div>💳 <strong>PAYMENT METHOD:</strong> {paymentMethod}</div>
              <div>🚚 <strong>STATUS:</strong> PACKED & PREPARED FOR DUBAI COURIER</div>
              <div className="text-[10px] text-[#00ffcc] pt-1 border-t border-[#222]">TRN COMPLIANT INVOICE: 100492817200003</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                onClick={() => {
                  playClick();
                  const invoiceWindow = window.open('', '_blank');
                  if (invoiceWindow) {
                    const invoiceHtml = generateTaxInvoiceHTML(lastCompletedOrder || {
                      id: orderId,
                      customer: formData.fullName,
                      email: formData.email,
                      phone: formData.phone,
                      address: `${formData.address}, ${formData.emirate}`,
                      items: 'CYBERRIDE NEXUS LED SMART BACKPACK',
                      color: 'STEALTH BLACK',
                      led: 'RED PULSE EYES',
                      total: 349,
                      zone: formData.emirate
                    });
                    invoiceWindow.document.write(invoiceHtml);
                    invoiceWindow.document.close();
                    invoiceWindow.print();
                  }
                }}
                className="px-5 py-3.5 rounded-xl bg-[#141414] border border-[#E10600]/40 text-xs font-mono text-white hover:border-[#E10600] flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#FF1A1A]" />
                <span>DOWNLOAD TAX INVOICE (PDF)</span>
              </button>

              <button
                onClick={() => {
                  playClick();
                  setIsCheckoutOpen(false);
                  setStep(1);
                }}
                className="cyber-button-primary flex-1 py-3.5 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                RETURN TO CONTROL CENTER
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
