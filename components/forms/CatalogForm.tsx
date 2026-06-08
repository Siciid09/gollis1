"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookImage, Tag, DollarSign, Layers, AlignLeft, Save, Ruler, UploadCloud, Loader2, ImageIcon } from "lucide-react";

// --- Firebase Imports ---
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase"; // Make sure this path points to your initialized firebase app

export interface CatalogData {
  id?: string;
  name: string;
  category: string;
  basePrice: number | string;
  measurementTemplate: string;
  description: string;
  imageUrl?: string; // NEW: Added image URL support
}

interface CatalogFormProps {
  initialData?: CatalogData;
  onSubmit: (data: CatalogData) => void;
  onCancel: () => void;
}

const CATEGORIES = ["Menswear", "Womenswear", "Uniforms", "Traditional", "Accessories"];
const TEMPLATES = ["Male", "Female", "Unisex"];

export default function CatalogForm({ initialData, onSubmit, onCancel }: CatalogFormProps) {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState<CatalogData>(
    initialData || { name: "", category: "Menswear", basePrice: "", measurementTemplate: "Male", description: "", imageUrl: "" }
  );

  // New states for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    let finalImageUrl = formData.imageUrl;

    try {
      // If a new file is selected, upload it to Firebase Storage
      if (imageFile) {
        const storage = getStorage(app);
        const storageRef = ref(storage, `catalog/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Submit the final data including the new image URL
      onSubmit({ 
        ...formData, 
        basePrice: Number(formData.basePrice),
        imageUrl: finalImageUrl 
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      onSubmit={handleSubmit}
      className="bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="mb-8 border-b border-white/5 pb-6 flex items-center gap-4">
        <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 shadow-inner">
          <BookImage size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">{isEditing ? "Update Blueprint" : "Add Catalog Item"}</h2>
          <p className="text-xs text-neutral-400 mt-1">Define standard garment types, base pricing, blueprints, and imagery.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Image Upload Area */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex justify-between">
            <span>Garment Blueprint Image</span>
            <span className="bg-neutral-800 px-1.5 rounded">Optional</span>
          </label>
          <div className="relative group w-full">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <div className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors ${imageFile ? 'border-violet-500 bg-violet-500/5' : 'border-neutral-800 bg-neutral-950 group-hover:border-violet-500/50'}`}>
              {imageFile ? (
                <div className="flex items-center gap-3 text-violet-400">
                  <ImageIcon size={24} />
                  <span className="text-sm font-bold truncate max-w-[200px]">{imageFile.name}</span>
                </div>
              ) : (
                <>
                  <UploadCloud size={28} className="text-neutral-500 group-hover:text-violet-400 transition-colors mb-2" />
                  <span className="text-sm text-neutral-400 font-medium">Click or drag image here to upload</span>
                  <span className="text-xs text-neutral-600 mt-1">JPEG, PNG, WEBP up to 5MB</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Garment Designation</label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-violet-400 transition-colors" size={18} />
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="e.g. Bespoke 3-Piece Suit" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Category</label>
          <div className="relative group">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-violet-400 transition-colors" size={18} />
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Measurement Template</label>
          <div className="relative group">
            <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-violet-400 transition-colors" size={18} />
            <select value={formData.measurementTemplate} onChange={(e) => setFormData({...formData, measurementTemplate: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none appearance-none transition-all">
              {TEMPLATES.map(temp => <option key={temp} value={temp}>{temp} Anatomy Metrics</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Base Construction Price ($)</label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input type="number" min="0" required value={formData.basePrice} onChange={(e) => setFormData({...formData, basePrice: e.target.value})} className="w-full bg-neutral-950 border border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all" placeholder="0.00" />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex justify-between"><span>Default Style Notes</span> <span className="bg-neutral-800 px-1.5 rounded">Optional</span></label>
          <div className="relative group">
            <AlignLeft className="absolute left-4 top-4 text-neutral-500 group-focus-within:text-violet-400 transition-colors" size={18} />
            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-all resize-none" placeholder="Standard specifications, included pockets, lining details..." />
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-4 border-t border-white/5 pt-6">
        <button type="button" disabled={isUploading} onClick={onCancel} className="px-6 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50">Cancel</button>
        <button type="submit" disabled={isUploading} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100">
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
          {isUploading ? "Uploading Data..." : isEditing ? "Update Blueprint" : "Save to Catalog"}
        </button>
      </div>
    </motion.form>
  );
}