export const headerLinks = [
  {
    label: 'Home',
    route: '/',
  },
  {
    label: 'Create Event',
    route: '/events/create',
  },
  {
    label: 'Search',
    route: '/events/find',
  },
  {
    label: 'My Profile',
    route: '/profile',
  },
]

export const eventDefaultValues = {
  title: '',
  description: '',
  location: '',
  eventLatitude: '',
  eventLongitude: '',
  imageUrl: '/assets/images/placeholder.png',
  date: new Date(),
  categoryId: '',
  price: '',
  isFree: false,
  url: '',
  isVirtual: false,
  meetingUrl: '',
  meetingId: '',
  meetingPassword: ''
}

export const searchEventDefaultValues = {
  date: new Date(),
  userLatitude: '',
  userLongitude: '',
}