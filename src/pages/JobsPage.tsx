
import { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useData } from '@/contexts/DataContext';
import { useJobs } from '@/contexts/JobContext';
import JobCard from '@/components/JobCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';

const JobsPage = () => {
  const { jobCategories } = useData();
  const { jobs, loading, loadJobs } = useJobs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  
  useEffect(() => {
    // Reload jobs on component mount
    loadJobs();
  }, []);
  
  useEffect(() => {
    // Filter jobs whenever jobs, search term, or filter categories change
    const filtered = jobs.filter(job => {
      // Category filter
      const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
      
      // Status filter
      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
      
      // Search filter
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedCategory, selectedStatus]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };
  
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 dark:text-white">Explorar propuestas</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Encuentra propuestas de trabajo que se ajusten a tus habilidades y experiencia
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar propuestas..."
            className="pl-8 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-white dark:focus:text-white dark:focus:bg-gray-700">Todas las categorías</SelectItem>
              {jobCategories.map((category, idx) => (
                <SelectItem 
                  key={idx} 
                  value={category}
                  className="dark:text-white dark:focus:text-white dark:focus:bg-gray-700"
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-white dark:focus:text-white dark:focus:bg-gray-700">Todos los estados</SelectItem>
              <SelectItem value="open" className="dark:text-white dark:focus:text-white dark:focus:bg-gray-700">Abierto</SelectItem>
              <SelectItem value="in-progress" className="dark:text-white dark:focus:text-white dark:focus:bg-gray-700">En progreso</SelectItem>
              <SelectItem value="completed" className="dark:text-white dark:focus:text-white dark:focus:bg-gray-700">Completado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            onClick={handleClearFilters}
          >
            <Filter className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Cargando propuestas...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 border rounded-lg border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron propuestas que coincidan con los criterios de búsqueda</p>
          <Button 
            onClick={handleClearFilters}
            className="mt-4 bg-wfc-purple hover:bg-wfc-purple-medium"
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default JobsPage;
