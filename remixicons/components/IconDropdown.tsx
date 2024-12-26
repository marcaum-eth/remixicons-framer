import React from 'react';
import * as remixIcons from "@remixicon/react";

//Create an interface for every icon
interface Icon {
    name: string;
    svg: string;
}

//Import all icons from remixIcons and map them to an array of Icon
const icons: Icon[] = Object.keys(remixIcons).map(key => ({
    name: key,
    svg: (remixIcons as any)[key],
}));

interface IconDropdownProps {
    onSelect: (svg: string) => void;
}

const IconDropdown: React.FC<IconDropdownProps> = ({ onSelect }) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIcon = icons.find(icon => icon.name === event.target.value);
        if (selectedIcon) {
            onSelect(selectedIcon.svg);
        }
    };

    return (
        <select onChange={handleChange}>
            {icons.map(icon => (
                <option key={icon.name} value={icon.name}>
                    {icon.name}
                </option>
            ))}
        </select>
    );
};

export default IconDropdown;