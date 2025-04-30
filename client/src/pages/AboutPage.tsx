import PageHeader from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <>
      <PageHeader 
        title="About AirSense" 
        description="Learn about our air quality monitoring platform"
        selectedLocation=""
      />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About AirSense</CardTitle>
          <CardDescription>The modern air quality monitoring solution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            AirSense is a comprehensive air quality monitoring platform that combines IoT sensors, data analytics, and artificial intelligence to provide accurate, real-time air quality information.
          </p>
          
          <h3 className="text-lg font-semibold mt-4">Our Mission</h3>
          <p>
            Our mission is to empower individuals, communities, and organizations with actionable insights about the air they breathe, enabling informed decisions that promote health and well-being.
          </p>
          
          <h3 className="text-lg font-semibold mt-4">Key Features</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-medium">Real-time Monitoring:</span> Continuous tracking of key air quality parameters</li>
            <li><span className="font-medium">Advanced Analytics:</span> Data visualization and trend analysis</li>
            <li><span className="font-medium">Predictive Forecasting:</span> AI-powered air quality predictions</li>
            <li><span className="font-medium">Anomaly Detection:</span> Automatic identification of unusual air quality events</li>
            <li><span className="font-medium">Personalized Recommendations:</span> Custom advice based on air quality conditions</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-4">Technology Stack</h3>
          <p>
            AirSense is built with modern web technologies including React, Tailwind CSS, and Firebase, providing a seamless, responsive user experience across devices.
          </p>
          
          <div className="pt-4 mt-4 border-t">
            <p className="text-sm text-gray-500">
              © 2023-2024 AirSense. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}