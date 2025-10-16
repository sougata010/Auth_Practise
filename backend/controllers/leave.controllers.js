import express from 'express';
import Leave from '../model/Leave.model.js';

const router = express.Router();


router.post('/', async (req, res) => {
    try {
        const { username, fullName, departure, arrival, reason, cancelLunchBefore, cancelDinnerBefore, cancelLunchAfter, cancelDinnerAfter } = req.body;

        const departureDateTime = new Date(departure);
        const arrivalDateTime = new Date(arrival);

        if (isNaN(departureDateTime.getTime()) || isNaN(arrivalDateTime.getTime())) {
            return res.status(400).json({ error: 'Invalid date or time format' });
        }

        if (arrivalDateTime <= departureDateTime) {
            return res.status(400).json({ error: 'Arrival must be after departure' });
        }

        const departureDate = departureDateTime.toISOString().split('T')[0];
        const arrivalDate = arrivalDateTime.toISOString().split('T')[0];
        const departureTime = departureDateTime.toTimeString().split(' ')[0].substring(0, 5);
        const arrivalTime = arrivalDateTime.toTimeString().split(' ')[0].substring(0, 5);

        const dayMealBefore = cancelLunchBefore || false;
        const nightMealBefore = cancelDinnerBefore || false;
        const dayMealAfter = cancelLunchAfter || false;
        const nightMealAfter = cancelDinnerAfter || false;
        const status="pending"
        const newLeave = new Leave({
            username,
            fullName,
            departureDate,
            arrivalDate,
            departureTime,
            arrivalTime,
            dayMealBefore,
            nightMealBefore,
            dayMealAfter,
            nightMealAfter,
            status,
            reason
        });

        await newLeave.save();

        res.status(201).json({ 
            message: 'Leave request submitted successfully',
            leaveId: newLeave._id 
        });

    } catch (error) {
        console.error('Error creating leave:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/history', async (req, res) => {
    try {
        const username = req.user?.username;

        if (!username) {
            return res.status(401).json({ error: 'Unauthorized: User not identified' });
        }

        const history = await Leave.find({ username })
            .sort({ createdAt: -1 })
            .select('departureDate arrivalDate departureTime arrivalTime reason status createdAt')
            .lean();

        const formattedHistory = history.map(leave => ({
            from: `${leave.departureDate} ${leave.departureTime}`,
            to: `${leave.arrivalDate} ${leave.arrivalTime}`,
            reason: leave.reason || 'No reason provided',
            status: leave.status || 'pending'
        }));

        res.status(200).json(formattedHistory);

    } catch (error) {
        console.error('Error fetching leave history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;