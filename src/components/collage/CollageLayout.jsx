import React from 'react';
import TopToolbar from './TopToolbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import CanvasStage from './CanvasStage';

export default function CollageLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] overflow-hidden">
      <TopToolbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 relative">
            <CanvasStage />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}