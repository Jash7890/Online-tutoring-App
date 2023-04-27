import React,{ useEffect, useState, Component } from "react"
import '../css/Styles.css'
import styles from '../css/StudentFeed.module.css'
import { useAuth } from "../context/AuthContext"
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { doc, getDoc, collection, getDocs, updateDoc} from "firebase/firestore";
import { db } from "../database-config/firebase";

export default function Home(){
    const {currentUser,assignAccountType} = useAuth()
    const [tutors, setTutors] = useState([])
    let userData
    const [email, setEmail] = useState('')
    const [favTutors, setFavTutors] = useState([])
    const docRef = doc(db, "students", currentUser.uid)
    const tutorsCollectionRef = collection(db, "tutors")
    assignAccountType('student')
    const [update, setUpdate] = useState(false)
    
    useEffect(() => {
        (async () => {
            try{
                console.log(docRef)
                const userDoc = await getDoc(docRef)
                const data = userDoc.data()
                console.log(data)
                userData = data
                console.log('userData')
                console.log(userData)
                setFavTutors([])
                userData.favorites.map (async (favorite) => {
                    const favoriteTutorRef = doc(db, 'tutors', favorite)
                    const favoriteTutorDoc = await getDoc(favoriteTutorRef)
                    const favoriteData = favoriteTutorDoc.data()
                    console.log('favorites')
                    console.log(favoriteData)
                    setFavTutors(oldFav => [...oldFav, favoriteData])
                })

            }catch(error){
                console.log(error)
            }
        })()

        const getTutors = async () => {
            const data = await getDocs(tutorsCollectionRef)
            setTutors(data.docs.map( (doc) => ({...doc.data(), id: doc.id})))
        }
        getTutors()

        }, [update]
    ) 


    const handleSubmit = event => {
        event.preventDefault()
    }

    const handleAddFavorites = async (event, id) => {
        event.preventDefault();
        console.log(id)
        const newFavoriteData = [`tutors/${id}`]
        setUpdate(prevValue => !prevValue)
        await updateDoc(docRef, {
            favorites: firebase.firestore.FieldValue.arrayUnion(id)
        })
    }

    return (
            <div class='container'>
                <div class='welcome-header'>
                    <h1>Hello {userData && userData.name.first}, welcome to TutorHub</h1>
                    <p>Search for a tutor that best matches your learning needs</p>
                    <form class='tutor-search-form'action='/' method="POST">
                        <input id='name' class="form-control" placeholder="Name" name='name' type='text' onChange={(e) => setEmail(e.target.value)}/>
                        <br/>
                        <input id='major' class="form-control" placeholder="Major" name='major' type='major' onChange={(e) => setEmail(e.target.value)}/>
                        <br/>
                        <button class="btn btn-primary" type="submit" onClick={handleSubmit}>Submit</button>
                    </form>
                    <div className={styles.searchResults}>
                    {tutors.map ( (tutor) => {
                            return (
                                <div class='card' className={styles.tutorCard}>
                                    <h1> {tutor.name.first} </h1>
                                    <button placeholder='Add to favorites'type='button' class='btn btn-outline-primary btn-sm' onClick={(event) => handleAddFavorites(event, tutor.id)}>add to favorites</button>
                                </div>
                                )
                    })}
                    </div>
                </div>
                <div class='student-content' className={styles.studentContent}>
                    <div class='container' className={styles.favoriteTutors}>
                        <h1>Your favorite tutors</h1>
                        {favTutors &&
                            favTutors.map ( (favorite) =>{
                                return(
                                    <div class='card' className={styles.tutorCard}>
                                        <h1> {favorite.name.first} </h1>
                                        <h1> {favorite.email} </h1>
                                    </div>
                                )
                            })
                        }
                            
                    </div>

                </div>
            </div>
        )
}
