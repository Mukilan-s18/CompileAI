import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in-up">
      <h1 className="text-4xl font-extrabold tracking-tight text-gradient pb-1">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
