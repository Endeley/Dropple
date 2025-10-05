'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Download, Edit, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type EditableElementType = 'text' | 'color' | 'image';

export interface EditableElement {
  id: string;
  type: EditableElementType;
  label: string;
  value: string;
}

export interface TemplateEditorProps {
  templateName: string;
  children: React.ReactNode;
  editableElements: EditableElement[];
  onUpdate: (elements: EditableElement[]) => void;
  onClose: () => void;
  onSave?: () => Promise<void> | void;
}

export function TemplateEditor({ templateName, children, editableElements, onUpdate, onClose, onSave }: TemplateEditorProps) {
  const [elements, setElements] = useState<EditableElement[]>(editableElements);
  const templateRef = useRef<HTMLDivElement>(null);

  const handleElementChange = (id: string, nextValue: string) => {
    setElements((prev) => {
      const updated = prev.map((element) => (element.id === id ? { ...element, value: nextValue } : element));
      onUpdate(updated);
      return updated;
    });
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        handleElementChange(id, event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (!templateRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(templateRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${templateName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Template downloaded successfully');
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to export template');
    }
  };

  const handleSave = async () => {
    try {
      await onSave?.();
      toast.success('Design saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save design');
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='flex w-full max-w-6xl max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white shadow-2xl'>
        <div className='flex items-center justify-between border-b border-slate-200 p-6'>
          <div className='flex items-center gap-3 text-slate-900'>
            <Edit className='h-5 w-5 text-blue-600' />
            <h2 className='text-[20px] font-bold'>Edit {templateName}</h2>
          </div>
          <div className='flex items-center gap-2'>
            {onSave ? (
              <Button onClick={handleSave} className='gap-2'>
                Save Design
              </Button>
            ) : null}
            <Button onClick={handleExport} className='gap-2'>
              <Download className='h-4 w-4' /> Download
            </Button>
            <Button onClick={onClose} variant='ghost' size='icon'>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='flex flex-1 overflow-hidden'>
          <aside className='w-80 space-y-6 overflow-y-auto border-r border-slate-200 p-6'>
            <div>
              <h3 className='mb-4 text-[14px] font-bold text-slate-900'>Customize Template</h3>
              <div className='space-y-4'>
                {elements.map((element) => (
                  <div key={element.id}>
                    <Label htmlFor={element.id} className='mb-2 block text-[12px] font-semibold text-slate-700'>
                      {element.label}
                    </Label>
                    {element.type === 'text' ? (
                      <Input id={element.id} value={element.value} onChange={(event) => handleElementChange(element.id, event.target.value)} />
                    ) : null}

                    {element.type === 'color' ? (
                      <div className='flex gap-2'>
                        <input
                          id={element.id}
                          type='color'
                          value={element.value}
                          onChange={(event) => handleElementChange(element.id, event.target.value)}
                          className='h-10 w-12 cursor-pointer rounded border border-slate-200'
                        />
                        <Input value={element.value} onChange={(event) => handleElementChange(element.id, event.target.value)} placeholder='#000000' />
                      </div>
                    ) : null}

                    {element.type === 'image' ? (
                      <div className='space-y-2'>
                        <Input
                          id={element.id}
                          type='file'
                          accept='image/*'
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) handleImageUpload(element.id, file);
                          }}
                        />
                        {element.value ? (
                          <div className='relative h-24 w-full overflow-hidden rounded border border-slate-200'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={element.value} alt='Preview' className='h-full w-full object-cover' />
                          </div>
                        ) : (
                          <div className='flex h-24 w-full items-center justify-center rounded border border-dashed border-slate-200 text-slate-400'>
                            <ImageIcon className='h-6 w-6' />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className='flex flex-1 items-center justify-center overflow-auto bg-slate-50 p-8'>
            <div ref={templateRef} className='inline-block'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
