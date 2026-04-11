import {
  collection,
    doc,
      getDocs,
        getDoc,
          addDoc,
            updateDoc,
              deleteDoc,
                query,
                  where,
                    orderBy,
                      limit,
                        serverTimestamp,
                          onSnapshot
                          } from 'firebase/firestore'
                          import { db } from './config'
                          import { toLocalizedField } from '../utils/localizedContent'

                          const splitList = (value) => {
                            if (Array.isArray(value)) return value.filter(Boolean)
                            if (typeof value !== 'string') return []
                            return value
                              .split(/\r?\n|,/)
                              .map(item => item.trim())
                              .filter(Boolean)
                          }

                          const cleanTimeLabel = (value) => {
                            if (typeof value !== 'string') return ''
                            return value
                              .replace(/\s*[–—]\s*/g, ' - ')
                              .replace(/\s*-\s*/g, ' - ')
                              .replace(/:\s*$/, '')
                              .replace(/\s{2,}/g, ' ')
                              .trim()
                          }

                          const parseItineraryLine = (line, index) => {
                            const trimmed = line.trim()
                            if (!trimmed) return null

                            const timeRangeMatch = trimmed.match(/^(\d{1,2}[:.]\d{2}\s*[-–]\s*(?:\d{1,2}[:.]\d{2}|[A-Za-zÀ-ÿ]+))(?:\s*[:|\-]\s*|\s+)(.+)$/)
                            if (timeRangeMatch) {
                              return {
                                time: cleanTimeLabel(timeRangeMatch[1]),
                                activity: timeRangeMatch[2].trim(),
                              }
                            }

                            const labelMatch = trimmed.match(/^([^:]+):\s+(.+)$/)
                            if (labelMatch) {
                              return {
                                time: cleanTimeLabel(labelMatch[1]),
                                activity: labelMatch[2].trim(),
                              }
                            }

                            return {
                              time: `Kegiatan ${index + 1}`,
                              activity: trimmed,
                            }
                          }

                          const normalizeItinerary = (value) => {
                            if (Array.isArray(value)) {
                              return value
                                .map((item, index) => {
                                  if (typeof item === 'string') {
                                    return {
                                      time: `Kegiatan ${index + 1}`,
                                      activity: item.trim(),
                                    }
                                  }

                                  return {
                                    time: cleanTimeLabel(item?.time || `Kegiatan ${index + 1}`),
                                    activity: item?.activity || item?.title || '',
                                  }
                                })
                                .filter(item => item.activity)
                            }

                            if (typeof value !== 'string') return []

                            return value
                              .split(/\r?\n/)
                              .map(parseItineraryLine)
                              .filter(Boolean)
                          }

                          const normalizeLocalizedText = (value) => {
                            const localized = toLocalizedField(value, (item) => typeof item === 'string' ? item.trim() : '')
                            return {
                              id: localized.id || '',
                              en: localized.en || '',
                            }
                          }

                          const normalizeLocalizedList = (value, legacyValue) => {
                            return toLocalizedField(value ?? legacyValue, splitList, [])
                          }

                          const normalizeLocalizedItinerary = (value) => {
                            return toLocalizedField(value, normalizeItinerary, [])
                          }

                          const normalizePackage = (data) => {
                            if (!data) return data

                            const departureDates = Array.isArray(data.departureDates)
                              ? data.departureDates
                              : splitList(data.departureDates)

                            return {
                              ...data,
                              images: Array.isArray(data.images) ? data.images.filter(Boolean) : (data.image ? [data.image] : []),
                              title: normalizeLocalizedText(data.title),
                              location: normalizeLocalizedText(data.location),
                              duration: normalizeLocalizedText(data.duration),
                              description: normalizeLocalizedText(data.description),
                              itinerary: normalizeLocalizedItinerary(data.itinerary),
                              includes: normalizeLocalizedList(data.includes, data.include),
                              excludes: normalizeLocalizedList(data.excludes, data.exclude),
                              slug: normalizeLocalizedText(data.slug),
                              departureDates: departureDates
                                .map(item => typeof item === 'string' ? item.trim() : '')
                                .filter(Boolean)
                                .sort(),
                            }
                          }

                          // =================== PACKAGES ===================
export const packagesCollection = collection(db, 'packages')

export const getPackages = async (type = null) => {
  const snapshot = await getDocs(packagesCollection)
  const packages = snapshot.docs.map(doc => normalizePackage({ id: doc.id, ...doc.data() }))

  return packages
    .filter(item => (type ? item.type === type : true))
    .filter(item => item.active !== false)
    .sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })
}

                                        export const getPackageById = async (id) => {
                                          const docRef = doc(db, 'packages', id)
                                            const docSnap = await getDoc(docRef)
                                              if (docSnap.exists()) return normalizePackage({ id: docSnap.id, ...docSnap.data() })
                                                return null
                                                }

                                                export const addPackage = async (data) => {
                                                  return await addDoc(packagesCollection, { ...data, createdAt: serverTimestamp() })
                                                  }

                                                  export const updatePackage = async (id, data) => {
                                                    const docRef = doc(db, 'packages', id)
                                                      return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
                                                      }

                                                      export const deletePackage = async (id) => {
                                                        const docRef = doc(db, 'packages', id)
                                                          return await deleteDoc(docRef)
                                                          }

                                                          // =================== BOOKINGS ===================
                                                          export const bookingsCollection = collection(db, 'bookings')

export const getBookings = async () => {
  const q = query(bookingsCollection, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }

      export const getOpenTripSlotUsage = async (packageId) => {
        const q = query(bookingsCollection, where('packageId', '==', packageId))
          const snapshot = await getDocs(q)
            return snapshot.docs.reduce((acc, bookingDoc) => {
              const booking = bookingDoc.data()
              const bookingDate = booking.date || booking.tripDate
              const bookingStatus = booking.status || 'pending'

              if (!bookingDate || bookingStatus === 'cancelled') {
                return acc
              }

              acc[bookingDate] = (acc[bookingDate] || 0) + (Number(booking.participants) || 1)
              return acc
            }, {})
            }

                                                                export const getBookingById = async (id) => {
                                                                  const docRef = doc(db, 'bookings', id)
                                                                    const docSnap = await getDoc(docRef)
                                                                      if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() }
                                                                        return null
                                                                        }

                                                                        export const addBooking = async (data) => {
                                                                          return await addDoc(bookingsCollection, {
                                                                              ...data,
                                                                                  status: 'pending',
                                                                                      createdAt: serverTimestamp()
                                                                                        })
                                                                                        }

                                                                                        export const updateBooking = async (id, data) => {
                                                                                          const docRef = doc(db, 'bookings', id)
                                                                                            return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
                                                                                            }

                                                                                            export const deleteBooking = async (id) => {
                                                                                              const docRef = doc(db, 'bookings', id)
                                                                                                return await deleteDoc(docRef)
                                                                                                }

                                                                                                // =================== PAYMENTS ===================
                                                                                                export const paymentsCollection = collection(db, 'payments')

export const getPayments = async () => {
  const q = query(paymentsCollection, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      }
      
      export const getPaymentByBookingId = async (bookingId) => {
        const q = query(paymentsCollection, where('bookingId', '==', bookingId), limit(1))
          const snapshot = await getDocs(q)
            if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
              return null
              }

              export const addPayment = async (data) => {
                return await addDoc(paymentsCollection, {
                    ...data,
                        status: data.status || 'pending',
                            createdAt: serverTimestamp()
                              })
                              }

                              export const upsertPaymentByBookingId = async (bookingId, data) => {
                                const existingPayment = await getPaymentByBookingId(bookingId)

                                if (existingPayment) {
                                  const docRef = doc(db, 'payments', existingPayment.id)
                                  await updateDoc(docRef, {
                                    ...data,
                                    updatedAt: serverTimestamp(),
                                  })
                                  return existingPayment.id
                                }

                                const newDoc = await addPayment({
                                  bookingId,
                                  ...data,
                                })
                                return newDoc.id
                              }
                                                                                                                      
                                                                                                                      export const updatePayment = async (id, data) => {
                                                                                                                        const docRef = doc(db, 'payments', id)
                                                                                                                          return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
                                                                                                                          }
                                                                                                                          
                                                                                                                          // =================== BLOG ===================
                                                                                                                          export const blogCollection = collection(db, 'blog')
                                                                                                                          
                                                                                                                          export const getBlogPosts = async () => {
                                                                                                                            const q = query(blogCollection, orderBy('createdAt', 'desc'))
                                                                                                                              const snapshot = await getDocs(q)
                                                                                                                                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                                                                                                                }
                                                                                                                                
                                                                                                                                export const getBlogBySlug = async (slug) => {
                                                                                                                                  const q = query(blogCollection, where('slug', '==', slug), limit(1))
                                                                                                                                    const snapshot = await getDocs(q)
                                                                                                                                      if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
                                                                                                                                        return null
                                                                                                                                        }
                                                                                                                                        
                                                                                                                                        export const addBlogPost = async (data) => {
                                                                                                                                          return await addDoc(blogCollection, { ...data, createdAt: serverTimestamp() })
                                                                                                                                          }
                                                                                                                                          
                                                                                                                                          export const updateBlogPost = async (id, data) => {
                                                                                                                                            const docRef = doc(db, 'blog', id)
                                                                                                                                              return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
                                                                                                                                              }
                                                                                                                                              
                                                                                                                                              export const deleteBlogPost = async (id) => {
                                                                                                                                                const docRef = doc(db, 'blog', id)
                                                                                                                                                  return await deleteDoc(docRef)
                                                                                                                                                  }
                                                                                                                                                  
                                                                                                                                                  // =================== GALLERY ===================
                                                                                                                                                  export const galleryCollection = collection(db, 'gallery')
                                                                                                                                                  
                                                                                                                                                  export const getGallery = async () => {
                                                                                                                                                    const q = query(galleryCollection, orderBy('createdAt', 'desc'))
                                                                                                                                                      const snapshot = await getDocs(q)
                                                                                                                                                        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                                                                                                                                        }
                                                                                                                                                        
                                                                                                                                                        export const addGalleryItem = async (data) => {
                                                                                                                                                          return await addDoc(galleryCollection, { ...data, createdAt: serverTimestamp() })
                                                                                                                                                          }
                                                                                                                                                          
                                                                                                                                                          export const deleteGalleryItem = async (id) => {
                                                                                                                                                            const docRef = doc(db, 'gallery', id)
                                                                                                                                                              return await deleteDoc(docRef)
                                                                                                                                                              }
                                                                                                                                                              
                                                                                                                                                              // =================== TESTIMONIALS ===================
                                                                                                                                                              export const testimonialsCollection = collection(db, 'testimonials')
                                                                                                                                                              
                                                                                                                                                              export const getTestimonials = async () => {
                                                                                                                                                                const q = query(testimonialsCollection, orderBy('createdAt', 'desc'))
                                                                                                                                                                  const snapshot = await getDocs(q)
                                                                                                                                                                    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                                                                                                                                                    }
                                                                                                                                                                    
                                                                                                                                                                    export const addTestimonial = async (data) => {
                                                                                                                                                                      return await addDoc(testimonialsCollection, { ...data, createdAt: serverTimestamp() })
                                                                                                                                                                      }
                                                                                                                                                                      
                                                                                                                                                                      export const updateTestimonial = async (id, data) => {
                                                                                                                                                                        const docRef = doc(db, 'testimonials', id)
                                                                                                                                                                          return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
                                                                                                                                                                          }
                                                                                                                                                                          
                                                                                                                                                                          export const deleteTestimonial = async (id) => {
                                                                                                                                                                            const docRef = doc(db, 'testimonials', id)
                                                                                                                                                                              return await deleteDoc(docRef)
                                                                                                                                                                              }
                                                                                                                                                                              
                                                                                                                                                                              // =================== SETTINGS ===================
                                                                                                                                                                              export const getSettings = async () => {
                                                                                                                                                                                const docRef = doc(db, 'settings', 'general')
                                                                                                                                                                                  const docSnap = await getDoc(docRef)
                                                                                                                                                                                    if (docSnap.exists()) return docSnap.data()
                                                                                                                                                                                      return {}
                                                                                                                                                                                      }
                                                                                                                                                                                      
                                                                                                                                                                                      export const updateSettings = async (data) => {
                                                                                                                                                                                        const docRef = doc(db, 'settings', 'general')
                                                                                                                                                                                          return await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
                                                                                                                                                                                          }
