import mongoose from 'mongoose';
import Course from './Course';
import { User } from '@clerk/express';

const PurchaseSchema = new mongoose.Schema({
    courseId: {type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    amount: {type: Number, required: true},
    status: {type: String, enum: ['pending', 'completed', 'failed'], default: 'pending'}
    }, {timestamps: true});

    export const Purchase = mongoose.model('Purchase', PurchaseSchema);
    
    // Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses )

    const educatorDashboardData = async (req, res) => {
        try {
            const educator = req.auth.userId;
            const courses = await Course.find({educator});
            const totalCourses = courses.length;

            const courseIds = courses.map(course => course._id);

            // Calculate total earnings from purchases
            const purchases = await Purchase.find({
                courseId: {$in: courseIds},
                status: 'completed'
            });

            const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

            // Collect unique enrolled student IDs with their course titles
            const enrolledStudentsData = [];
            for(const course of courses) {
                const students = await User.find({ _id: { $in: course.enrolledStudents } 
                }, 'name imageUrl');

                students.forEach(student => {
                    enrolledStudentsData.push({
                        courseTitle: course.courseTitle,
                        student
                    });
                });
            }

            res.json({success: true, dashboardData: {
                totalEarnings, enrolledStudentsData, totalCourses
            }})
        } catch (error) {
            res.json({ success: false, message: error.message });
        }
    }

    // Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({ success: true, enrolledStudents });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}