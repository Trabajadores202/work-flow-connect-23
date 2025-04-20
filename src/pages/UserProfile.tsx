
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { useJobs } from '@/contexts/JobContext';
import { UserType } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import JobCard from '@/components/JobCard';
import { MessageCircle } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { getUserById } = useData();
  const { jobs } = useJobs();
  const { createOrGetDirectChat } = useChat();
  
  const [user, setUser] = useState<UserType | null>(null);
  const [userJobs, setUserJobs] = useState([]);
  
  useEffect(() => {
    if (userId) {
      const userData = getUserById(userId);
      if (userData) {
        setUser(userData);
      }
    }
  }, [userId, getUserById]);
  
  useEffect(() => {
    if (userId && Array.isArray(jobs)) {
      setUserJobs(jobs.filter(job => job.userId === userId));
    }
  }, [userId, jobs]);
  
  const handleStartChat = async () => {
    if (user) {
      try {
        const chatId = await createOrGetDirectChat(user.id);
        window.location.href = `/chats/${chatId}`;
      } catch (error) {
        console.error('Error al crear chat:', error);
      }
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="dark:text-white">Usuario no encontrado</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.photoURL} alt={user.name} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white text-2xl">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold mb-1 dark:text-white">{user.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {user.role === 'freelancer' ? 'Freelancer' : 'Cliente'}
                  </p>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 border-wfc-purple text-wfc-purple hover:bg-wfc-purple hover:text-white dark:border-wfc-purple-medium dark:text-wfc-purple-medium dark:hover:bg-wfc-purple-medium dark:hover:text-white"
                    onClick={handleStartChat}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </Button>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Habilidades</h3>
                    <div className="flex flex-wrap gap-1">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No hay habilidades especificadas</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Información</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Miembro desde</span>
                        <span className="font-medium dark:text-white">
                          {user.joinDate ? formatDate(user.joinDate) : "Apr 2025"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Calificación</span>
                        <span className="font-medium dark:text-white">5.0 ⭐</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Trabajos completados</span>
                        <span className="font-medium dark:text-white">12</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="about">Acerca de</TabsTrigger>
                <TabsTrigger value="proposals">Propuestas</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Biografía</CardTitle>
                  </CardHeader>
                  <CardContent className="dark:text-gray-300">
                    {user.bio ? (
                      <p>{user.bio}</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">Este usuario no ha añadido una biografía todavía.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="proposals" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Propuestas publicadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userJobs.length === 0 ? (
                      <p className="text-center py-6 text-gray-500 dark:text-gray-400">
                        Este usuario no ha publicado ninguna propuesta todavía.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {userJobs.map(job => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
