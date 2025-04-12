
/**
 * Componente de Página de Perfil de Usuario
 * 
 * Esta página muestra el perfil de otro usuario incluyendo:
 * - Información personal del usuario y foto de perfil
 * - Biografía y habilidades del usuario
 * - Botón para contactar/chatear con el usuario
 * - Lista de propuestas publicadas por el usuario
 * 
 * Maneja la lógica para crear un nuevo chat o navegar a uno existente
 * cuando se hace clic en el botón "Contactar".
 */

import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const UserProfile = () => {
  // Obtener el ID del usuario de los parámetros de la URL
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  // Hooks de contexto para acceder a datos y funcionalidades
  const { getUserById } = useData(); // Para obtener datos del usuario
  const { jobs } = useJobs(); // Para obtener propuestas
  const { currentUser } = useAuth(); // Usuario actual autenticado
  const { createPrivateChat, findExistingPrivateChat } = useChat(); // Funcionalidades de chat
  
  // Obtener datos del usuario desde el ID en la URL
  const user = userId ? getUserById(userId) : undefined;
  
  // Filtrar propuestas publicadas por este usuario
  const userJobs = jobs.filter(job => job.userId === userId);
  
  /**
   * Manejar el clic en el botón "Contactar"
   * Esta función abre un chat existente o crea uno nuevo
   */
  const handleContactClick = () => {
    if (!currentUser || !user) return;
    
    // Verificar si ya existe un chat con este usuario
    const existingChat = findExistingPrivateChat(user.id);
    
    if (existingChat) {
      // Si existe un chat, navegar a él
      navigate('/chats');
      toast({
        title: "Chat existente",
        description: `Abriendo la conversación con ${user.name}`
      });
    } else {
      // Si no, crear uno nuevo
      createPrivateChat(user.id);
      navigate('/chats');
      toast({
        title: "Chat iniciado",
        description: `Has iniciado una conversación con ${user.name}`
      });
    }
  };

  // Función auxiliar para formatear fechas
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Fecha no disponible";
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Mostrar mensaje si no se encuentra el usuario
  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Usuario no encontrado</h2>
          <p className="text-gray-600 mt-2">El usuario que estás buscando no existe o ha sido eliminado.</p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Volver al inicio
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Tarjeta de perfil de usuario */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-[200px_1fr]">
              {/* Foto de perfil y botón de contacto */}
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.photoURL} alt={user.name} />
                  <AvatarFallback className="bg-wfc-purple-medium text-white text-4xl">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mt-4">{user.name}</h2>
                
                {/* Solo mostrar botón de contacto si no es el usuario actual */}
                {currentUser && currentUser.id !== userId && (
                  <Button 
                    className="mt-4 w-full bg-wfc-purple hover:bg-wfc-purple-medium"
                    onClick={handleContactClick}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                )}
              </div>
              
              {/* Información del usuario */}
              <div className="space-y-6">
                {/* Biografía */}
                {user.bio ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Biografía</h3>
                    <p className="text-gray-700">{user.bio}</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Biografía</h3>
                    <p className="text-gray-500 italic">Este usuario no ha agregado una biografía.</p>
                  </div>
                )}
                
                {/* Habilidades */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Habilidades</h3>
                  {user.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} className="bg-wfc-purple-medium text-white">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No se han agregado habilidades</p>
                  )}
                </div>
                
                {/* Información adicional */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-gray-600 mb-1">Email</h4>
                    <p>{user.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-600 mb-1">Miembro desde</h4>
                    <p>{user.joinedAt ? formatDate(user.joinedAt) : "Abril 2025"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Propuestas del usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Propuestas de {user.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {userJobs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">Este usuario aún no ha publicado propuestas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userJobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:border-wfc-purple cursor-pointer transition-colors"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-gray-500">
                          Publicado el {formatDate(job.timestamp)}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <Badge className={`
                          ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
                            job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {job.status === 'open' ? 'Abierto' : 
                            job.status === 'in-progress' ? 'En progreso' : 
                            'Completado'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="outline" className="bg-gray-50 text-xs">
                          +{job.skills.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
