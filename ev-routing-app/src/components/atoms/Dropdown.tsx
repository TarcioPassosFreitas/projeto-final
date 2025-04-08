import { Listbox } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'
import { Fragment } from 'react'

interface Props {
  options: string[]
  value: string
  onChange: (v: string) => void
}

export default function Dropdown({ options, value, onChange }: Props) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-full">
        <Listbox.Button className="w-full flex items-center justify-between px-4 py-3 rounded-full bg-black/30 backdrop-blur-md border border-cyan-400/20 shadow-md shadow-cyan-400/10 text-cyan-300 font-medium">
          {value || 'Select your car'}
          <ChevronDown className="ml-2 text-cyan-400" size={20} />
        </Listbox.Button>

        <Listbox.Options className="absolute mt-2 w-full rounded-xl bg-black/70 backdrop-blur-md border border-cyan-400/10 shadow-lg shadow-cyan-500/10 z-10 overflow-hidden">
          {options.map((o) => (
            <Listbox.Option
              key={o}
              value={o}
              as={Fragment}
            >
              {({ active, selected }) => (
                <li
                  className={`px-4 py-3 cursor-pointer text-cyan-300 ${
                    active ? 'bg-cyan-500/10' : ''
                  } ${selected ? 'font-bold' : ''}`}
                >
                  {o}
                </li>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  )
}
