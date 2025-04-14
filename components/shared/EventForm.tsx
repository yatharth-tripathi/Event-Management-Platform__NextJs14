"use client"

import { useState } from 'react'
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"


import { eventDefaultValues } from '../../constants/index'
import { eventFormSchema } from '@/lib/validator'
import { useUploadThing } from '@/lib/uploadthing'
import { IEvent } from "@/lib/database/models/event.model"

import DropDown from '@/components/shared/DropDown'
import { FileUploader } from "./FileUploader"
import { createEvent, updateEvent } from '../../lib/actions/event.actions'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UpdateEvent from '@/app/(root)/events/[id]/update/page'

// type
type EventFormProps = {
    userId: string,
    type: 'Create' | 'Update',
    event?: IEvent,
    eventId?: string
}

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {

    const [files, setFiles] = useState<File[]>([])
    const [startDate, setStartDate] = useState(new Date());

    const initialValues = eventDefaultValues;
    const { startUpload } = useUploadThing('imageUploader')
    const router = useRouter()

    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: event && type === 'Update' ? {
            ...event,
            date: new Date(event.date)
        } : initialValues
    })

    // Watch isVirtual field to conditionally show meeting fields
    const isVirtual = form.watch('isVirtual');

    // handle location acesss
    const handleLocationAccess = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    // console.log(`latitude = ${latitude} , longitude = ${longitude}`)

                    // Set latitude and longitude in form data
                    form.setValue("eventLatitude", latitude.toString());
                    form.setValue("eventLongitude", longitude.toString());
                },
                (error) => {
                    console.error('Error getting location:', error.message);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    };


    // submit handler
    async function onSubmit(values: z.infer<typeof eventFormSchema>) {
        console.log("submited form values => ", values)
        let uploadImageUrl = values.imageUrl;

        if (files.length > 0) {
            const uploadImages = await startUpload(files)
            if (!uploadImages) { return }

            uploadImageUrl = uploadImages[0].url;
        } else {
            // Set a default placeholder image if no image was uploaded
            uploadImageUrl = '/assets/images/placeholder.png';
        }

        // create event
        if (type === 'Create') {
            try {
                const newEvent = await createEvent({
                    event: { ...values, imageUrl: uploadImageUrl },
                    userId,
                    path: '/profile'
                });
                if (newEvent) {
                    console.log("Event created successfully 🎉", newEvent)
                    form.reset();
                    router.push(`/events/${newEvent._id}`)
                } else {
                    console.log("Event NOT created")
                }
            } catch (error) {
                console.log('Error while creating event:', error);
            }
        }

        // update event
        if (type === 'Update') {
            try {
                if (!eventId) {
                    router.back();
                    return;
                }
                const updatedEvent = await updateEvent({
                    event: { ...values, imageUrl: uploadImageUrl, _id: eventId },
                    userId,
                    path: `/events/${eventId}`
                });
                if (updatedEvent) {
                    console.log("Event updated successfully 🎉", updatedEvent)
                    form.reset();
                    router.push(`/events/${updatedEvent._id}`)
                }
                else {
                    console.log("Event NOT updated")
                }
            } catch (error) {
                console.log('Error while creating event:', error);
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 ">
                {/* event name - category */}
                <div className='flex flex-col gap-5 md:flex-row'>
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl>
                                    <Input placeholder="Event title" {...field} className='input-field' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl>
                                    <DropDown
                                        onChangeHandler={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* description- image upload */}
                <div className='flex flex-col gap-5 md:flex-row '>
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl className='h-72'>
                                    <Textarea placeholder="Description" {...field} className='textarea rounded-2xl' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl className='h-72'>
                                    <FileUploader
                                        onFieldChange={field.onChange}
                                        imageUrl={field.value}
                                        setFiles={setFiles}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* location */}
                <div className='flex flex-col gap-5 md:gap-3 md:flex-row '>
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl>
                                    <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                        <Image
                                            src='/assets/icons/location-gray.svg'
                                            width={24}
                                            height={24}
                                            alt='location'
                                        />

                                        <Input placeholder="Event location" {...field} className='input-field' />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* latitude, longitude */}
                    <div className='flex-center flex-co gap-2 md:flex-row '>
                        <FormField
                            control={form.control}
                            name="eventLatitude"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="latitude"
                                                className='input-field'
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="eventLongitude"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="longitude"
                                                className='input-field' />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="button"
                            size='default'
                            disabled={form.formState.isSubmitting}
                            onClick={handleLocationAccess}
                        >
                            Get location
                        </Button>
                    </div>
                </div>

                {/* date */}
                <div className='flex flex-col gap-5 md:flex-row '>
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl>
                                    <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                        <Image
                                            src='/assets/icons/calendar.svg'
                                            width={24}
                                            height={24}
                                            alt='calendar'
                                            className='filter-grey'
                                        />

                                        <p className='ml-3 whitespace-nowrap text-grey-600 '>Date:</p>
                                        <DatePicker
                                            selected={field.value}
                                            onChange={(date: Date) => field.onChange(date)}
                                            // showTimeSelect
                                            // timeInputLabel="Time:"
                                            dateFormat="dd/MM/yyyy"
                                            wrapperClassName="datePicker cursor-pointer"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* price */}
                <div className='flex flex-col gap-5 md:flex-row '>
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl>
                                    <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                        <Image
                                            src="/assets/icons/dollar.svg"
                                            alt="dollar"
                                            width={24}
                                            height={24}
                                            className="filter-grey"
                                        />
                                        <Input type="number" placeholder="Price" {...field} className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />

                                        {/* is free */}
                                        <FormField
                                            control={form.control}
                                            name="isFree"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className='flex items-center '>
                                                            <label htmlFor="isFree" className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                Free Ticket
                                                            </label>
                                                            <Checkbox
                                                                id={'isFree'}
                                                                onCheckedChange={field.onChange}
                                                                checked={field.value}
                                                                className='mr-2 w-5 h-5 border-2 border-primary-500 '
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    {/* link */}
                    <div className='flex flex-col gap-5 md:flex-row '>
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                            <Image
                                                src='/assets/icons/link.svg'
                                                width={24}
                                                height={24}
                                                alt='location'
                                            />

                                            <Input placeholder="URL" {...field} className='input-field' />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Virtual Event Toggle */}
                <div className='flex flex-col gap-5 md:flex-row'>
                    <FormField
                        control={form.control}
                        name="isVirtual"
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl>
                                    <div className='flex items-center gap-3 rounded-full bg-grey-50 px-4 py-2'>
                                        <Checkbox
                                            id={'isVirtual'}
                                            onCheckedChange={field.onChange}
                                            checked={field.value}
                                            className='mr-2 h-5 w-5 border-2 border-primary-500'
                                        />
                                        <label htmlFor="isVirtual" className="whitespace-nowrap pr-3 leading-none">
                                            Virtual Event
                                        </label>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Virtual Event Details - Only show if isVirtual is true */}
                {isVirtual && (
                    <div className='flex flex-col gap-5 md:flex-row'>
                        <FormField
                            control={form.control}
                            name="meetingUrl"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                            <Image
                                                src='/assets/icons/link.svg'
                                                width={24}
                                                height={24}
                                                alt='meeting'
                                                className='filter-grey'
                                            />
                                            <Input placeholder="Meeting URL (e.g. Zoom link)" {...field} className='input-field' />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="meetingId"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                            <Image
                                                src='/assets/icons/file-upload.svg'
                                                width={24}
                                                height={24}
                                                alt='id'
                                                className='filter-grey'
                                            />
                                            <Input placeholder="Meeting ID" {...field} className='input-field' />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="meetingPassword"
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <div className='flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2'>
                                            <Image
                                                src='/assets/icons/link.svg'
                                                width={24}
                                                height={24}
                                                alt='password'
                                                className='filter-grey transform rotate-45'
                                            />
                                            <Input placeholder="Meeting Password" type="password" {...field} className='input-field' />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <Button
                    type="submit"
                    size='lg'
                    disabled={form.formState.isSubmitting}
                    className='button col-span-2 w-full'
                >
                    {form.formState.isSubmitting ? 'submitting...' : `${type} Event`}
                </Button>
            </form>
        </Form>
    )
}

export default EventForm