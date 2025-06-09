
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 bg-slate-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-slate-600" />
                  <Skeleton className="h-8 w-16 bg-slate-600" />
                  <Skeleton className="h-3 w-24 bg-slate-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48 bg-slate-600" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 flex-1 bg-slate-600" />
                  <Skeleton className="h-4 w-20 bg-slate-600" />
                  <Skeleton className="h-4 w-16 bg-slate-600" />
                  <Skeleton className="h-4 w-24 bg-slate-600" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const EmptyState = ({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description: string; 
  action?: React.ReactNode; 
}) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#00FF88] to-[#39FF14] rounded-full opacity-20"></div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
};
