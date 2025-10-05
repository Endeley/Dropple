'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { fabric } from 'fabric';
import { Save, Type, Square, Circle, Image as ImageIcon } from 'lucide-react';

import { api } from '../../../../convex/_generated/api';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

const DEFAULT_SIZE = { width: 1080, height: 1080 };

const fallbackCategories = ['popular', 'business', 'enterprise', 'ecommerce', 'education'];

export default function NewTemplatePage() {
    const canvasRef = useRef(null);
    const elementRef = useRef(null);

    const [title, setTitle] = useState('Untitled Template');
    const [slug, setSlug] = useState('untitled-template');
    const [category, setCategory] = useState('popular');

    const createTemplate = useMutation(api.templatesAdmin.create);

    useEffect(() => {
        if (!elementRef.current || canvasRef.current) return;
        const canvas = new fabric.Canvas(elementRef.current, {
            preserveObjectStacking: true,
            selection: true,
        });
        canvas.setWidth(DEFAULT_SIZE.width);
        canvas.setHeight(DEFAULT_SIZE.height);
        canvasRef.current = canvas;

        return () => {
            canvas.dispose();
            canvasRef.current = null;
        };
    }, []);

    const handleTitleChange = (value) => {
        setTitle(value);
        if (!value) return;
        setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    };

    const addText = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const text = new fabric.IText('Edit me', {
            left: 80,
            top: 80,
            fontSize: 64,
            fill: '#111827',
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const addRectangle = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = new fabric.Rect({
            left: 200,
            top: 200,
            width: 420,
            height: 260,
            fill: '#EEF2FF',
            rx: 24,
            ry: 24,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
    };

    const addCircle = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const circle = new fabric.Circle({
            left: 420,
            top: 420,
            radius: 120,
            fill: '#FDE68A',
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
    };

    const addImage = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = window.prompt('Image URL');
        if (!url) return;
        fabric.Image.fromURL(
            url,
            (img) => {
                img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
            },
            { crossOrigin: 'anonymous' }
        );
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const payload = {
            version: 1,
            title,
            canvas: { width: canvas.getWidth(), height: canvas.getHeight() },
            elements: [],
            fabric: canvas.toJSON(),
        };

        await createTemplate({
            title,
            slug,
            category,
            description: 'Created with the admin template builder',
            data: payload,
            tags: [category],
            isFeatured: false,
            thumbnailUrl: undefined,
        });

        window.alert('Template saved');
    };

    return (
        <div className='mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8'>
            <header className='space-y-2'>
                <h1 className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>Create a new template</h1>
                <p className='text-sm text-slate-500 dark:text-slate-400'>Design a layout using the canvas below and save it into the template library.</p>
            </header>

            <div className='grid gap-3 md:grid-cols-3'>
                <Input value={title} onChange={(event) => handleTitleChange(event.target.value)} placeholder='Title' />
                <Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder='slug' />
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder='Category' />
                    </SelectTrigger>
                    <SelectContent>
                        {fallbackCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className='flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm'>
                <Button type='button' variant='outline' onClick={addText} className='inline-flex items-center gap-2'>
                    <Type className='h-4 w-4' /> Text
                </Button>
                <Button type='button' variant='outline' onClick={addRectangle} className='inline-flex items-center gap-2'>
                    <Square className='h-4 w-4' /> Rectangle
                </Button>
                <Button type='button' variant='outline' onClick={addCircle} className='inline-flex items-center gap-2'>
                    <Circle className='h-4 w-4' /> Circle
                </Button>
                <Button type='button' variant='outline' onClick={addImage} className='inline-flex items-center gap-2'>
                    <ImageIcon className='h-4 w-4' /> Image
                </Button>
                <Button type='button' className='ml-auto inline-flex items-center gap-2' onClick={handleSave}>
                    <Save className='h-4 w-4' /> Save as template
                </Button>
            </div>

            <div className='rounded-3xl border border-[var(--border)] bg-white p-4 shadow-sm dark:bg-slate-900'>
                <div className='overflow-auto rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900'>
                    <canvas ref={elementRef} width={DEFAULT_SIZE.width} height={DEFAULT_SIZE.height} className='mx-auto block bg-white shadow-sm dark:bg-slate-950' />
                </div>
            </div>
        </div>
    );
}
