'use client';

import Collection from '@/components/shared/Collection';
import { getEventDetailsById, getRelatedEventsByCategory } from '@/lib/actions/event.actions';
import { formatDateTime } from '@/lib/utils';
import { SearchParamProps } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@clerk/nextjs';
import ZoomMeeting from '@/components/shared/ZoomMeeting';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const EventDetails = ({ params: { id }, searchParams }: SearchParamProps) => {
    const [showZoomMeeting, setShowZoomMeeting] = useState(false);
    const { userId } = auth();
    const [event, setEvent] = useState(null);
    const [relatedEvents, setRelatedEvents] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const eventData = await getEventDetailsById(id);
            setEvent(eventData);
            
            const relatedEventsData = await getRelatedEventsByCategory({
                categoryId: eventData.category._id,
                eventId: eventData._id,
                page: searchParams.page as string,
            });
            setRelatedEvents(relatedEventsData);
        };
        
        fetchData();
    }, [id, searchParams.page]);

    if (!event) return <div>Loading...</div>;

    return (
        <>
            <section className="flex justify-center bg-primary-50 bg-dotted-pattern bg-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:max-w-7xl p-5 md:p-10">
                    <Image
                        src={event.imageUrl}
                        alt="hero image"
                        width={1000}
                        height={1000}
                        className="h-full min-h-[300px] rounded-2xl object-cover object-center"
                    />

                    <div className="flex w-full flex-col gap-8 py-5 md:p-10">
                        <div className="flex flex-col gap-6">
                            <h2 className='h2-bold'>{event.title}</h2>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex gap-3">
                                    <p className="p-bold-20 rounded-full bg-green-500/10 px-5 py-2 text-green-700">
                                        {event.isFree ? 'FREE' : `$${event.price}`}
                                    </p>
                                    <p className="p-medium-16 rounded-full bg-grey-500/10 px-4 py-2.5 text-grey-500">
                                        {event.category.name}
                                    </p>
                                </div>

                                <p className="p-medium-18 ml-2 mt-2 sm:mt-0">
                                    by{' '}
                                    <span className="text-primary-500">{event.organizer.firstName} {event.organizer.lastName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-5">
                            <div className='flex gap-2 md:gap-3'>
                                <Image src="/assets/icons/calendar.svg" alt="calendar" width={32} height={32} />
                                <div className="p-medium-16 lg:p-regular-20 flex flex-wrap items-center">
                                    <p>
                                        {formatDateTime(event.date).dateOnly}
                                    </p>
                                </div>
                            </div>

                            <div className="p-regular-20 flex items-center gap-3">
                                <Image src="/assets/icons/location.svg" alt="location" width={32} height={32} />
                                <p className="p-medium-16 lg:p-regular-20">{event.location}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="p-bold-20 text-grey-600">What You'll Learn:</p>
                            <p className="p-medium-16 lg:p-regular-18">{event.description}</p>
                            <Link href={event.url} className="p-medium-16 lg:p-regular-18 truncate text-primary-500 underline" target='_blank'>
                                {event.url}
                            </Link>
                        </div>

                        {/* Virtual Event Details */}
                        {event.isVirtual && (
                            <div className="flex flex-col gap-5 rounded-xl bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Image src="/assets/icons/link.svg" alt="virtual" width={32} height={32} />
                                    <h3 className="p-bold-20">Virtual Event Details</h3>
                                </div>
                                <div className="flex flex-col gap-3 pl-11">
                                    {!showZoomMeeting ? (
                                        <Button 
                                            onClick={() => setShowZoomMeeting(true)}
                                            className="w-full md:w-auto"
                                        >
                                            Join Meeting Now
                                        </Button>
                                    ) : (
                                        <div className="w-full aspect-video">
                                            <ZoomMeeting 
                                                meetingNumber={event.meetingId}
                                                userName={`${event.organizer.firstName} ${event.organizer.lastName}`}
                                                password={event.meetingPassword}
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Image src="/assets/icons/file-upload.svg" alt="id" width={20} height={20} />
                                        <p className="p-medium-16">Meeting ID: {event.meetingId}</p>
                                    </div>
                                    {event.meetingPassword && (
                                        <div className="flex items-center gap-2">
                                            <Image src="/assets/icons/link.svg" alt="password" width={20} height={20} className="transform rotate-45" />
                                            <p className="p-medium-16">Password: {event.meetingPassword}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* EVENTS with the same category */}
            <section className="wrapper my-8 flex flex-col gap-8 md:gap-12">
                <h2 className="h2-bold">Related Events</h2>
                {relatedEvents && (
                    <Collection
                        data={relatedEvents?.data}
                        emptyTitle="No Events Found"
                        emptyStateSubText="Come back later"
                        collectionType="All_Events"
                        limit={3}
                        page={searchParams.page as string}
                        totalPages={relatedEvents?.totalPages}
                    />
                )}
            </section>
        </>
    );
};

export default EventDetails;