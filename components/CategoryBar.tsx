
import React from 'react';
import { CATEGORIES } from '../constants';

interface CategoryBarProps {
  selectedCategory: string;
  onSelect: (id: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelect }) => {
  return (
    <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
      <div className="py-6 flex flex-row items-center justify-between overflow-x-auto no-scrollbar gap-10">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelect(cat.label)}
            className="flex flex-col items-center justify-center gap-2 transition cursor-pointer min-w-max pb-2 text-neutral-500 hover:text-neutral-800"
          >
            <span className="text-sm font-semibold">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBar;
