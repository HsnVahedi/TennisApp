// "use client";

// import React from 'react';
// import { useForm, SubmitHandler } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';

// type FormValues = {
//   subject: 'investment' | 'feedback' | 'partnership' | 'other';
//   email: string;
//   message: string;
// };

// const schema = yup.object().shape({
//   subject: yup
//     .mixed<'investment' | 'feedback' | 'partnership' | 'other'>()
//     .oneOf(['investment', 'feedback', 'partnership', 'other'], 'Select a valid subject')
//     .required('Subject is required'),
//   email: yup.string().email('Invalid email').required('Email is required'),
//   message: yup
//     .string()
//     .max(2000, 'Message cannot exceed 2000 characters')
//     .required('Message is required'),
// });

// const ContactUs: React.FC = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting, isSubmitSuccessful },
//     reset,
//   } = useForm<FormValues>({
//     resolver: yupResolver(schema),
//   });

//   const onSubmit: SubmitHandler<FormValues> = async (data) => {
//     // Handle form submission
//     // For demonstration, we'll just log the data
//     console.log(data);
//     // Reset the form after successful submission
//     reset();
//     // Optionally, show a success message or perform other actions
//   };

//   return (
//     <div className="w-full max-w-6xl mx-auto mt-12 p-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-md">
//       <h2 className="text-3xl font-bold mb-6 text-purple-900">Contact Us</h2>
//       {isSubmitSuccessful && (
//         <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
//           Your message has been sent successfully!
//         </div>
//       )}
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         {/* Subject Selection */}
//         <div>
//           <label htmlFor="subject" className="block text-purple-900 font-medium mb-2">
//             Subject
//           </label>
//           <select
//             id="subject"
//             {...register('subject')}
//             className={`w-full px-3 py-2 border ${
//               errors.subject ? 'border-red-500' : 'border-gray-300'
//             } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600`}
//           >
//             <option value="">Select a subject</option>
//             <option value="investment">Investment</option>
//             <option value="feedback">Feedback</option>
//             <option value="partnership">Partnership</option>
//             <option value="other">Other</option>
//           </select>
//           {errors.subject && (
//             <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
//           )}
//         </div>

//         {/* Email Input */}
//         <div>
//           <label htmlFor="email" className="block text-purple-900 font-medium mb-2">
//             Email
//           </label>
//           <input
//             type="email"
//             id="email"
//             {...register('email')}
//             className={`w-full px-3 py-2 border ${
//               errors.email ? 'border-red-500' : 'border-gray-300'
//             } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600`}
//             placeholder="your.email@example.com"
//           />
//           {errors.email && (
//             <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//           )}
//         </div>

//         {/* Message Textarea */}
//         <div>
//           <label htmlFor="message" className="block text-purple-900 font-medium mb-2">
//             Message
//           </label>
//           <textarea
//             id="message"
//             {...register('message')}
//             className={`w-full px-3 py-2 border ${
//               errors.message ? 'border-red-500' : 'border-gray-300'
//             } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600`}
//             rows={6}
//             placeholder="Your message..."
//           ></textarea>
//           {errors.message && (
//             <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
//           )}
//         </div>

//         {/* Submit Button */}
//         <div>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-purple-700 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 transition duration-300"
//           >
//             {isSubmitting ? 'Submitting...' : 'Submit'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ContactUs;




"use client";

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

type FormValues = {
  subject: 'investment' | 'feedback' | 'partnership' | 'other';
  email: string;
  message: string;
};

const schema = yup.object().shape({
  subject: yup
    .mixed<'investment' | 'feedback' | 'partnership' | 'other'>()
    .oneOf(['investment', 'feedback', 'partnership', 'other'], 'Select a valid subject')
    .required('Subject is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  message: yup
    .string()
    .max(2000, 'Message cannot exceed 2000 characters')
    .required('Message is required'),
});

const ContactUs: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // Handle form submission
    console.log(data);
    reset(); // Reset the form after successful submission
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 backdrop-blur-lg rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-purple-900">
        Have any questions? Contact us! We're here to help.
      </h2>
      {isSubmitSuccessful && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
          Your message has been sent successfully!
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Subject Selection */}
        <div>
          <label htmlFor="subject" className="block text-purple-900 font-medium mb-2 text-left">
            Subject
          </label>
          <select
            id="subject"
            {...register('subject')}
            className={`w-full px-3 py-2 border ${
              errors.subject ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-purple-900`}
          >
            <option value="">Select a subject</option>
            <option value="investment">Investment</option>
            <option value="feedback">Feedback</option>
            <option value="partnership">Partnership</option>
            <option value="other">Other</option>
          </select>
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-purple-900 font-medium mb-2 text-left">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full px-3 py-2 border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-purple-900`}
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Message Textarea */}
        <div>
          <label htmlFor="message" className="block text-purple-900 font-medium mb-2 text-left">
            Message
          </label>
          <textarea
            id="message"
            {...register('message')}
            className={`w-full px-3 py-2 border ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-purple-900`}
            rows={6}
            placeholder="Your message..."
          ></textarea>
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-700 text-white font-bold py-2 px-4 rounded hover:bg-purple-600 transition duration-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactUs;

