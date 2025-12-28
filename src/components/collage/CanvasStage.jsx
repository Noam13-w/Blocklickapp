import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Star, Transformer, Image as KonvaImage, Text as KonvaText } from 'react-konva';
import useImage from 'use-image';
import { useCollageStore } from '@/components/collage/store';

// URLImage Component for rendering images
const URLImage = ({ imageObj, isSelected, onSelect, onChange }) => {
  const [img] = useImage(imageObj.src, 'anonymous'); // Add anonymous crossOrigin
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        image={img}
        ref={shapeRef}
        {...imageObj}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...imageObj,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // Reset scale to 1 and adjust width/height for better image quality if needed, 
          // but for now keeping scale is easier for state management
          onChange({
            ...imageObj,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: scaleX,
            scaleY: scaleY,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// Editable Text Component
const EditableText = ({ textObj, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaText
        ref={shapeRef}
        {...textObj}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...textObj,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          onChange({
            ...textObj,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </>
  );
};

// Shape Component (Rect, Circle, Star)
const ShapeElement = ({ shapeObj, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    ...shapeObj,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e) => onChange({ ...shapeObj, x: e.target.x(), y: e.target.y() }),
    onTransformEnd: (e) => {
      const node = shapeRef.current;
      onChange({
        ...shapeObj,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      });
    }
  };

  return (
    <>
      {shapeObj.subtype === 'rect' && <Rect ref={shapeRef} {...commonProps} />}
      {shapeObj.subtype === 'circle' && <Circle ref={shapeRef} {...commonProps} />}
      {shapeObj.subtype === 'star' && <Star ref={shapeRef} {...commonProps} numPoints={5} innerRadius={20} outerRadius={40} />}
      
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default function CanvasStage() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const { 
    canvasSpecs, 
    orientation, 
    objects, 
    selectedId, 
    selectObject, 
    updateObject,
    setStageScale,
    stageScale
  } = useCollageStore();

  const width = orientation === 'landscape' ? Math.max(canvasSpecs.width, canvasSpecs.height) : Math.min(canvasSpecs.width, canvasSpecs.height);
  const height = orientation === 'landscape' ? Math.min(canvasSpecs.width, canvasSpecs.height) : Math.max(canvasSpecs.width, canvasSpecs.height);

  useEffect(() => {
    const fitStage = () => {
      if (!containerRef.current) return;
      const containerW = containerRef.current.offsetWidth;
      const containerH = containerRef.current.offsetHeight;
      
      // Safety check for 0 dimensions
      if (containerW === 0 || containerH === 0) return;

      const padding = 60;
      const availW = Math.max(100, containerW - padding * 2);
      const availH = Math.max(100, containerH - padding * 2);

      const scaleW = availW / width;
      const scaleH = availH / height;

      const scale = Math.min(scaleW, scaleH, 1); 
      
      // Ensure scale is valid positive number
      if (scale > 0 && isFinite(scale)) {
        setStageScale(scale);
      }
    };

    // Initial fit
    fitStage();
    
    // Fit on resize
    const observer = new ResizeObserver(() => {
        fitStage();
    });
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [width, height, setStageScale]);

  const handleDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectObject(null);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative"
    >
        <div style={{
            width: width * stageScale,
            height: height * stageScale,
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            position: 'relative'
        }}>
            <div style={{
                transform: `scale(${stageScale})`,
                transformOrigin: 'top left',
                width: width,
                height: height,
            }}>
                <Stage
                    width={width}
                    height={height}
                    onMouseDown={handleDeselect}
                    onTouchStart={handleDeselect}
                    ref={stageRef}
                    className="bg-white"
                    // Add ID for easier selection
                    id="collage-stage"
                >
                <Layer>
                    <Rect width={width} height={height} fill="white" shadowColor="black" shadowBlur={10} shadowOpacity={0.1} />
                    
                    {objects.map((obj) => {
                        if (obj.type === 'image') {
                            return (
                                <URLImage
                                    key={obj.id}
                                    imageObj={obj}
                                    isSelected={obj.id === selectedId}
                                    onSelect={() => selectObject(obj.id)}
                                    onChange={(newAttrs) => updateObject(obj.id, newAttrs)}
                                />
                            );
                        }
                        if (obj.type === 'text') {
                            return (
                                <EditableText
                                    key={obj.id}
                                    textObj={obj}
                                    isSelected={obj.id === selectedId}
                                    onSelect={() => selectObject(obj.id)}
                                    onChange={(newAttrs) => updateObject(obj.id, newAttrs)}
                                />
                            );
                        }
                        if (obj.type === 'shape') {
                           return (
                               <ShapeElement
                                   key={obj.id}
                                   shapeObj={obj}
                                   isSelected={obj.id === selectedId}
                                   onSelect={() => selectObject(obj.id)}
                                   onChange={(newAttrs) => updateObject(obj.id, newAttrs)}
                               />
                           );
                        }
                        return null;
                    })}
                </Layer>
            </Stage>
            </div>
        </div>
        
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs z-10 pointer-events-none">
            {Math.round(stageScale * 100)}%
        </div>
    </div>
  );
}