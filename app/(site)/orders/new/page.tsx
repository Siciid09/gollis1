"use client";

import { useRouter } from "next/navigation";
import OrderForm, { OrderData } from "@/components/forms/OrderForm";

export default function NewOrderPage() {
  const router = useRouter();

  const handleSubmit = async (data: OrderData) => {
    try {
      // Sends the POST request to your existing API route
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save the order");
      }

      // Redirect back to the orders matrix on success
      router.push('/orders');
      
    } catch (error) {
      console.error("Database Error:", error);
      alert("Failed to save the order.");
    }
  };

  const handleCancel = () => {
    // Return to the previous page if the user cancels
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-10 relative overflow-hidden">
      {/* Background Ambient Glows to match your UI */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <OrderForm 
          onSubmit={handleSubmit} 
          onCancel={handleCancel} 
        />
      </div>
    </div>
  );
}