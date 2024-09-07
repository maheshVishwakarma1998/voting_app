const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate');
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');


const CheckAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.userRole === 'admin';
    } catch (error) {
        return false
    }
}

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await CheckAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });

        const data = req.body // Assuming the request body contains the candidate data

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({ response: response });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await CheckAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (! await CheckAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter

        const response = await Candidate.findByIdAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate deleted successfully');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


// POST route to vote a candidate
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try {
        // find candidate by id
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'candidate not found' })
        }

        //find user by id
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }

        if (user.isVoted) {
            return res.status(400).json({ message: 'user already voted' });
        }

        if (user.userRole == 'admin') {
            return res.status(403).json({ message: 'admin are not allowed for voting' });
        }

        // update candidate document to record the vote 
        candidate.votes.push({ user: userId });
        candidate.voteCount++;
        await candidate.save();

        // update user document after he voted
        user.isVoted = true;
        await user.save();
        console.log("thanks for voting");
        res.status(200).json({ message: 'vote recorded successfully' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


router.get('/vote/count', async (req, res) => {

    try {
        // find all candidate and sorted by descending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        // map the candidate to only return their name and voteCount

        const voteRecord = candidate.map((data) => {
            return {
                name: data.name,
                party: data.party,
                voteCount: data.voteCount

            }
        });

        return res.status(200).json(voteRecord);

    } catch (error) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/candidate', async (req, res) => {

    try {
        // find all candidate and sorted by descending order
        const candidate = await Candidate.find();
        if(candidate.length == 0){
            return res.status(400).json({message: 'Zero candidate created yet'});
        }
        return res.status(200).json(candidate);

    } catch (error) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




module.exports = router;