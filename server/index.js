const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 7000;

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://expreane-c2384.web.app'],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' });
    }
    req.user = decoded;
    next();
  });
};


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aakl4py.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db('ExpressLane').collection('users');
    const productsCollection = client.db('ExpressLane').collection('products');
    const reviewsCollection = client.db('ExpressLane').collection('reviews');
    const paymentsCollection = client.db('ExpressLane').collection('payments');

    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      });
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });
    

    // Logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true });
        console.log('Logout successful');
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // create payment intent
    app.post('/create-payment-intent', verifyToken, async (req, res) => {
      const { price } = req.body;  
      if(!price || price <= 1) return res.status(400).send({ message: 'Invalid price' });
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method_types: ['card'],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });



    app.put('/user', async (req, res) => {
      try {
        const updatedUser = req.body;
        const query = { email: updatedUser.email };

        const existingUser = await usersCollection.findOne(query);

        if (!existingUser) {
          // User doesn't exist, insert a new user
          const result = await usersCollection.insertOne({ ...updatedUser, timestamp: new Date() });
          return res.send(result);
        }

        // User exists, update only changed fields
        const updateFields = {};
        if (updatedUser.displayName && updatedUser.displayName !== existingUser.displayName) {
          updateFields.displayName = updatedUser.displayName;
        }
        if (updatedUser.photoURL && updatedUser.photoURL !== existingUser.photoURL) {
          updateFields.photoURL = updatedUser.photoURL;
        }
        if (updatedUser.phoneNumber && updatedUser.phoneNumber !== existingUser.phoneNumber) {
          updateFields.phoneNumber = updatedUser.phoneNumber;
        }

        if (Object.keys(updateFields).length > 0) {
          // There are fields to update
          const result = await usersCollection.updateOne(query, { $set: updateFields });
          const updatedUser = await usersCollection.findOne(query);
          return res.send(updatedUser);
        } else {
          // No fields were updated
          return res.send(existingUser);
        }
      } catch (error) {
        res.status(500).send({ error: 'Failed to update user data' });
      }
    });

    // get a user info by email from db
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    // update user role
    app.patch('/users/update/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUserData = req.body;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: updatedUserData.role,
        },
      };

      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // get all user data
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // get all parcel data
    app.get('/parcels',  async (req, res) => {
      const parcels = await productsCollection.find().toArray();
      res.send(parcels);
    });

    // save a parcel form data to database
    app.post('/parcel', async (req, res) => {
      const parcelData = {
        ...req.body,
        status: 'pending',
      };
      const result = await productsCollection.insertOne(parcelData);
      res.send(result);
    });

    // get my parcel data
    app.get('/my-parcel/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // update a parcel
    app.patch('/parcel/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const { deliveryManId, approximateDeliveryDate, status } = req.body;

      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {},
      };
      if (deliveryManId) updateDoc.$set.deliveryManId = deliveryManId;
      if (approximateDeliveryDate) updateDoc.$set.approximateDeliveryDate = approximateDeliveryDate;
      if (status) updateDoc.$set.status = status;

      const result = await productsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // delete a parcel
    app.delete('/my-parcel/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // get all delivery men
    app.get('/users', async (req, res) => {
      const role = req.query.role;
      if (role) {
        const query = { role: role };
        const result = await usersCollection.find(query).toArray();
        res.send(result);
      } else {
        const result = await usersCollection.find().toArray();
        res.send(result);
      }
    });

    // get parcel data for a specific delivery man
    app.get('/my-delivery/:email', verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const deliveryMan = await usersCollection.findOne({ email, role: 'DeliveryMen' });

        if (!deliveryMan) {
          return res.status(404).send({ error: 'Delivery man not found' });
        }

        const deliveryManId = deliveryMan._id.toString();
        const parcels = await productsCollection.find({ deliveryManId }).toArray();

        res.send(parcels);
      } catch (error) {
        console.error('Error fetching parcels:', error);
        res.status(500).send({ error: 'Failed to fetch parcels' });
      }
    });

  
   //save a review
app.post('/reviews', verifyToken, async (req, res) => {
  try {
      const reviewData = req.body;
      const result = await reviewsCollection.insertOne(reviewData);
      res.send(result);
  } catch (error) {
      console.error('Error saving review:', error);
      res.status(500).send({ error: 'Failed to save review' });
  }
});
// Get all reviews
app.get('/reviews', async (req, res) => {
    const reviews = await reviewsCollection.find().toArray();
    res.send(reviews);
});



// get reviews of a delivery man
app.get('/reviews/delivery-man/:deliveryManId', verifyToken, async (req, res) => {
  try {
    const deliveryManId = req.params.deliveryManId;
    const query = { deliveryManId: deliveryManId };
    const result = await reviewsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send({ error: 'Failed to fetch reviews' });
  }
});

//get statistics

app.get('/statistics', async (req, res) => {
  try {
    const totalBooked = await productsCollection.countDocuments();
    const totalDelivered = await productsCollection.countDocuments({ status: 'delivered' });
    const totalUsers = await usersCollection.countDocuments();

    res.send({ totalBooked, totalDelivered, totalUsers });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send({ error: 'Failed to fetch statistics' });
  }
});


// Get top 3 delivery men by number of deliveries and average rating
app.get('/top-delivery-men', async (req, res) => {
  try {
      const users = await usersCollection.find({ role: 'DeliveryMen' }).toArray();
      console.log('Delivery Men:', users);

      const topDeliveryMen = await usersCollection.aggregate([
          { $match: { role: 'DeliveryMen' } }, 
          {
              $lookup: {
                  from: 'reviews',
                  localField: 'email', 
                  foreignField: 'deliveryManId',
                  as: 'reviews',
              },
          },
          {
              $addFields: {
                  numDeliveries: { $size: '$reviews' },
                  averageRating: {
                      $cond: [
                          { $gt: [{ $size: '$reviews' }, 0] },
                          { $avg: '$reviews.rating' },
                          0
                      ]
                  },
              },
          },
          { $sort: { numDeliveries: -1, averageRating: -1 } },
          { $limit: 3 },
      ]).toArray();

      console.log('Top Delivery Men:', topDeliveryMen); // Add this line for debugging
      res.send(topDeliveryMen);
  } catch (error) {
      console.error('Error fetching top delivery men:', error);
      res.status(500).send({ error: 'Failed to fetch top delivery men' });
  }
});







// Get bookings grouped by date
app.get('/bookingsByDate', async (req, res) => {
  try {
      const result = await productsCollection.aggregate([
          {
              $addFields: {
                  createdDate: { $toDate: "$createdDate" }  
              }
          },
          {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdDate" } }, 
                  count: { $sum: 1 }
              }
          },
          { $sort: { _id: 1 } } 
      ]).toArray();
      res.send(result);
  } catch (error) {
      console.error('Error fetching bookings by date:', error.message);
      res.status(500).send({ error: 'Failed to fetch bookings by date', message: error.message });
  }
});







    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from ExpressLane Server..');
});

app.listen(port, () => {
  console.log(`ExpressLane is running on port ${port}`);
});
