export interface StorageLocation {
    _id: any
    capacity: ReactNode
    pricePerDay: ReactNode
    timings: ReactNode
    city: ReactNode
    isOpen: any
    id: string
    name: string
    address: string
    distance: string
    rating: number
    reviewCount: number
    hourlyPrice: number
    dailyPrice: number
    openTime: string
    closeTime: string
    amenities: string[]
    coordinates: {
      lat: number
      lng: number
    }
  }
  
  export interface Booking {
    id: string
    locationId: string
    dropOffDate: string
    pickUpDate: string
    numberOfBags: number
    status: 'active' | 'completed' | 'cancelled'
    totalPrice: number
  }
  
  export interface SearchParams {
    location: string
    date: string
    bags: number
  }
  
  