'use client';

import { useState, useEffect } from 'react';
import { firestore } from "@/firebase";
import { Box, Typography, Modal, Stack, TextField, Button, Card, CardContent, Select, MenuItem, Pagination, Grid } from "@mui/material";
import { query, collection, getDocs, setDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { updateDoc } from "firebase/firestore";


// Dashboard Component
const Dashboard = ({ inventory }) => {
  const totalItems = inventory.length;
  const totalQuantity = inventory.reduce((acc, item) => acc + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.quantity < 5).length;

  return (
    <Box sx={{ p: 2, bgcolor: '#F8EDE3', borderRadius: 5, mb: 2, boxShadow: 1, margin: 10}}>
      <Typography variant="h4" sx={{ mb:3, mt:2,fontFamily: 'Montserrat, sans-serif', textAlign: 'center' }}>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#D0B8A8', boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Total Items</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif' }}>{totalItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#D0B8A8', boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Total Quantity</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif' }}>{totalQuantity}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#D0B8A8', boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Low Stock Items</Typography>
              <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif' }}>{lowStockItems}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

const Home = () => {
  const router = useRouter();
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [editedName, setEditedName] = useState('');
  const [editedQuantity, setEditedQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Function to update inventory
  const updateInventory = async () => {
    const snapshot = await getDocs(query(collection(firestore, 'inventory')));
    const inventoryList = [];
    snapshot.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  // Function to add an item
  const addItem = async (item) => {
    if (!item) return; // Exit if item name is empty

    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await updateDoc(docRef, { quantity: quantity + 1 }); // Use updateDoc here
    } else {
        await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory(); // Refresh inventory data
};

  // Function to remove an item
  const removeItem = async (item) => {
    if (!item) return; // Exit if item name is empty

    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  // Function to edit an item
  const editItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), editedName);
    await setDoc(docRef, { quantity: editedQuantity });
    setEditingItem(null);
    updateInventory();
  };

  // Function to export inventory to CSV
  const exportToCSV = () => {
    const csvData = [['Name', 'Quantity']];
    inventory.forEach(item => {
      csvData.push([item.name, item.quantity]);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInventory = filteredInventory.sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else {
      return sortDirection === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
    }
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedInventory.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setPage(1); // Reset to first page when search term changes
}, [searchTerm]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: '100vh',
        bgcolor: '#8D493A', // Dark background for the main container
      }}
    >
      <Box sx={{ bgcolor: '#F8EDE3', p: 2 }}> {/* Header */}
        <Typography variant="h4" color="black" textAlign= "center" paddingTop={1} margin="20px 20px"  sx={{ fontFamily: 'Montserrat, sans-serif' }}>Streamlined</Typography>
      </Box>

      <Dashboard inventory={inventory} />

      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ width: '80%', maxWidth: '800px', bgcolor: '#F8EDE3', borderRadius: 2, boxShadow: 1, p: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontFamily: 'Montserrat, sans-serif' }}>Manage Inventory</Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              InputProps={{
                style: { fontFamily: 'Montserrat, sans-serif' },
              }}
            />
            <Button variant="contained" color="primary" onClick={() => setOpen(true)} sx={{ bgcolor: '#8D493A', '&:hover': { bgcolor: '#8D493A' }, fontFamily: 'Montserrat, sans-serif' }}>
              Add New Item
            </Button>
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: 'space-between' }}>
            <Box>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: 120, fontFamily: 'Montserrat, sans-serif' }}
              >
                <MenuItem value="name" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Name</MenuItem>
                <MenuItem value="quantity" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Quantity</MenuItem>
              </Select>
              <Select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                sx={{ minWidth: 120, fontFamily: 'Montserrat, sans-serif' }}
              >
                <MenuItem value="asc" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Ascending</MenuItem>
                <MenuItem value="desc" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Descending</MenuItem>
              </Select>
            </Box>
            <Button variant="contained" color="primary" onClick={exportToCSV} sx={{ bgcolor: '#8D493A', '&:hover': { bgcolor: '#D0B8A8' }, fontFamily: 'Montserrat, sans-serif' }}>
              Download
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {currentItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.name}>
                <Card sx={{ boxShadow: 1, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontFamily: 'Montserrat, sans-serif' }}>{item.name}</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Montserrat, sans-serif' }}>Quantity: {item.quantity}</Typography>
                    <Button variant="outlined" color="primary" sx={{ mt: 1, fontFamily: 'Montserrat, sans-serif' }} onClick={() => removeItem(item.name)}>
                      Remove
                    </Button>
                    <Button variant="outlined" color="secondary" sx={{ mt: 1, fontFamily: 'Montserrat, sans-serif' }} onClick={() => { setEditingItem(item); setEditedName(item.name); setEditedQuantity(item.quantity); setOpen(true); }}>
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={Math.ceil(sortedInventory.length / itemsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              sx={{ '& .MuiPaginationItem-root': { fontFamily: 'Montserrat, sans-serif' } }}
            />
          </Box>
        </Box>
      </Box>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setEditingItem(null); }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: "white",
            border: "1px solid #ccc",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Montserrat, sans-serif' }}>{editingItem ? 'Edit Item' : 'Add New Item'}</Typography>
          <Stack spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              label="Item Name"
              value={editingItem ? editedName : itemName}
              onChange={(e) => editingItem ? setEditedName(e.target.value) : setItemName(e.target.value)}
              InputLabelProps={{
                style: { fontFamily: 'Montserrat, sans-serif' },
              }}
              InputProps={{
                style: { fontFamily: 'Montserrat, sans-serif' },
              }}
            />
            <TextField
              variant="outlined"
              fullWidth
              label="Quantity"
              type="number"
              value={editingItem ? editedQuantity : 1}
              onChange={(e) => editingItem ? setEditedQuantity(Number(e.target.value)) : null}
              InputLabelProps={{
                style: { fontFamily: 'Montserrat, sans-serif' },
              }}
              InputProps={{
                style: { fontFamily: 'Montserrat, sans-serif' },
                inputProps: { min: 1 },
              }}
            />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary" onClick={editingItem ? editItem : () => { addItem(itemName); setItemName(''); }} sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editingItem ? 'Save Changes' : 'Add Item'}
              </Button>
              <Button variant="contained" color="secondary" onClick={() => { setOpen(false); setEditingItem(null); }} sx={{ fontFamily: 'Montserrat, sans-serif' }}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default Home;
