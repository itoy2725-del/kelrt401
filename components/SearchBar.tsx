'use client';

import { Search, Mic, QrCode } from 'lucide-react';

export default function SearchBar() {
    return (
        <div className="bg-[#0066cc] px-4 pb-3">
            <div className="bg-white rounded-lg flex items-center px-4 py-3 gap-3">
                <Search size={20} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Eve ne lazım?"
                    className="flex-1 outline-none text-gray-700"
                />
                <Mic size={20} className="text-gray-400" />
                <QrCode size={20} className="text-gray-400" />
            </div>
        </div>
    );
}