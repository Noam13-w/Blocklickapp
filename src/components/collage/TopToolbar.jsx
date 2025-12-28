import React, { useState } from 'react';
import { useCollageStore } from '@/components/collage/store';
import { Download, Layout, Smartphone, Monitor, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from '@/components/GlobalCart';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function TopToolbar() {
  const { 
    canvasSpecs, 
    setCanvasSpecs, 
    orientation, 
    setOrientation, 
    isAdmin, 
    toggleAdmin
  } = useCollageStore();

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const dataURLToBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const getStageCanvas = () => {
    // Try to find by ID first
    const stageContainer = document.getElementById('collage-stage');
    if (stageContainer) {
        return stageContainer.querySelector('canvas');
    }
    // Fallback
    return document.querySelector('.konvajs-content canvas');
  };

  const handleExport = () => {
    try {
        const stageCanvas = getStageCanvas();
        if (stageCanvas) {
            const dataUrl = stageCanvas.toDataURL({ pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `collage-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Download started!");
        } else {
            toast.error("Could not find canvas to generate image.");
        }
    } catch (e) {
        console.error("Export error:", e);
        toast.error("Failed to export image. Check for external image issues.");
    }
  };

  const handleAddToCart = async () => {
      setIsAddingToCart(true);
      try {
        const stageCanvas = getStageCanvas();
        if (!stageCanvas) throw new Error("Canvas not found");

        // 1. Generate Image Blob
        const dataUrl = stageCanvas.toDataURL({ pixelRatio: 2 });
        const blob = dataURLToBlob(dataUrl);
        const file = new File([blob], `collage-${Date.now()}.png`, { type: 'image/png' });

        // 2. Upload to Server
        const uploadRes = await base44.integrations.Core.UploadFile({ file: file });
        
        if (!uploadRes || !uploadRes.file_url) {
            throw new Error("Upload failed");
        }

        // 3. Add to Cart
        let productType = 'block';
        let price = 50; 

        addToCart({
            type: productType,
            size: `${canvasSpecs.width}x${canvasSpecs.height}`,
            price: price,
            image_url: uploadRes.file_url,
            quantity: 1,
            orientation: orientation
        });

        toast.success("Collage added to cart!");
        navigate(createPageUrl("Cart"));

      } catch (error) {
          console.error(error);
          toast.error("Failed to add to cart: " + (error.message || "Unknown error"));
      } finally {
          setIsAddingToCart(false);
      }
  };

  return (
    <div className="h-16 bg-[#252525] border-b border-[#333] flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-white font-bold text-lg mr-4">PrintMyCollage</h1>
        
        <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Size:</span>
            <Select 
                value={`${canvasSpecs.width}x${canvasSpecs.height}`} 
                onValueChange={(val) => {
                    const [w, h] = val.split('x').map(Number);
                    setCanvasSpecs({ width: w, height: h });
                }}
            >
                <SelectTrigger className="w-[180px] bg-[#333] border-none text-white h-9">
                    <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent className="bg-[#333] border-[#444] text-white">
                    <SelectItem value="2000x2000">Square (2000x2000)</SelectItem>
                    <SelectItem value="4000x3000">Standard (4000x3000)</SelectItem>
                    <SelectItem value="3000x2000">Photo (3000x2000)</SelectItem>
                    <SelectItem value="3000x1000">Banner (3000x1000)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="flex bg-[#333] rounded-md p-1 gap-1">
            <button 
                onClick={() => setOrientation('portrait')}
                className={`p-1.5 rounded ${orientation === 'portrait' ? 'bg-[#444] text-white' : 'text-gray-400 hover:text-white'}`}
                title="Portrait"
            >
                <Smartphone className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setOrientation('landscape')}
                className={`p-1.5 rounded ${orientation === 'landscape' ? 'bg-[#444] text-white' : 'text-gray-400 hover:text-white'}`}
                title="Landscape"
            >
                <Monitor className="w-4 h-4" />
            </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-4">
            <label className="text-xs text-gray-500 cursor-pointer flex items-center gap-2">
                <input 
                    type="checkbox" 
                    checked={isAdmin} 
                    onChange={toggleAdmin}
                    className="rounded bg-[#333] border-[#444]"
                />
                Admin Mode
            </label>
        </div>

        <Button 
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-[#333] hover:text-white gap-2"
            onClick={handleExport}
        >
            <Download className="w-4 h-4" />
            Download
        </Button>

        <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
        >
            {isAddingToCart ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            Add to Cart
        </Button>
      </div>
    </div>
  );
}