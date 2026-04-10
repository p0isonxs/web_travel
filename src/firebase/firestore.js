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

                          // =================== PACKAGES ===================
                          export const packagesCollection = collection(db, 'packages')

                          export const getPackages = async (type = null) => {
                            let q = type
                                ? query(packagesCollection, where('type', '==', type), orderBy('createdAt', 'desc'))
                                    : query(packagesCollection, orderBy('createdAt', 'desc'))
                                      const snapshot = await getDocs(q)
                                        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                        }

                                        export const getPackageById = async (id) => {
                                          const docRef = doc(db, 'packages', id)
                                            const docSnap = await getDoc(docRef)
                                              if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() }
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
                                                                                                      
                                                                                                      export const addPayment = async (data) => {
                                                                                                        return await addDoc(paymentsCollection, {
                                                                                                            ...data,
                                                                                                                status: 'pending',
                                                                                                                    createdAt: serverTimestamp()
                                                                                                                      })
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
