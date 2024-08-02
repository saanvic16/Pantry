'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Stack, Typography, Button, Modal, TextField, IconButton, Snackbar, Alert, InputBase, Paper, Grid, Card, CardContent, CardActions
} from '@mui/material';
import { firestore, auth } from '@/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Add, Remove } from '@mui/icons-material';
import Auth from './auth';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: 'Raleway, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#FF6F61',
          color: '#FFFFFF',
          borderRadius: '12px',
          padding: '8px 16px',
          fontWeight: 'bold',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#FF8A80',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '& fieldset': {
              borderColor: '#FF6F61',
            },
            '&:hover fieldset': {
              borderColor: '#FF6F61',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF6F61',
            },
          },
        },
      },
    },
  },
});

const Page = () => {
  const [inventory, setInventory] = useState([]);
  const [localInventory, setLocalInventory] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadInventory(currentUser.uid);
      }
    });
  }, []);

  const loadInventory = useCallback(async (userId) => {
    const snapshot = await getDocs(collection(firestore, `users/${userId}/inventory`));
    const inventoryList = [];
    snapshot.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
    setLocalInventory(inventoryList);
  }, []);

  const syncInventory = useCallback(async () => {
    if (!user) return;
    const batch = writeBatch(firestore);
    localInventory.forEach(item => {
      const docRef = doc(collection(firestore, `users/${user.uid}/inventory`), item.name);
      batch.set(docRef, { quantity: item.quantity });
    });
    await batch.commit();
    setSnackbarMessage('Inventory synced successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  }, [localInventory, user]);

  const addItem = (item, qty) => {
    setLocalInventory((prevInventory) => {
      const updatedInventory = prevInventory.map(i => i.name === item ? { ...i, quantity: i.quantity + qty } : i);
      if (!updatedInventory.find(i => i.name === item)) {
        updatedInventory.push({ name: item, quantity: qty });
      }
      return updatedInventory;
    });
  };

  const removeItem = (item, qty) => {
    setLocalInventory((prevInventory) => {
      const updatedInventory = prevInventory.map(i => i.name === item ? { ...i, quantity: Math.max(0, i.quantity - qty) } : i);
      return updatedInventory;
    });
  };

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  const handleOpenRemove = () => setOpenRemove(true);
  const handleCloseRemove = () => setOpenRemove(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setSnackbarMessage('Sign out successful!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error signing out:', error);
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRequestSort = (property) => {
    const isAscending = orderBy === property && order === 'asc';
    setOrder(isAscending ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedFilteredInventory = localInventory
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        width="100vw"
        height="100vh"
        bgcolor="linear-gradient(135deg, #f9f9f9, #eaeaea)"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding="20px"
      >
        {!user ? (
          <Box display="flex" flexDirection="column" alignItems="center" p={4}>
            <Typography variant="h2" sx={{ color: '#FF6F61', fontWeight: 700 }} mb={2} textAlign="center">
              
            </Typography>
            <Auth onUserChange={(user) => user && loadInventory(user.uid)} />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" gap={3} p={2} width="100%" maxWidth="1200px">
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" onClick={handleSignOut}>
                Sign Out
              </Button>
              <Button variant="contained" onClick={handleOpenAdd}>
                Add Item
              </Button>
              <Button variant="contained" onClick={handleOpenRemove}>
                Remove Item
              </Button>
              <Button variant="contained" onClick={syncInventory}>
                Save Items
              </Button>
            </Stack>
            <Modal
              open={openAdd}
              onClose={handleCloseAdd}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: '400px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  borderRadius: '12px',
                }}
              >
                <Typography id="modal-modal-title" variant="h6" sx={{ color: '#FF6F61', fontWeight: 700 }} component="h2">
                  Add Item
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    label="Quantity"
                    type="number"
                    variant="outlined"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </Stack>
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(itemName, quantity);
                    setItemName('');
                    setQuantity(1);
                    handleCloseAdd();
                  }}
                  sx={{ mt: 2 }}
                >
                  Add
                </Button>
              </Box>
            </Modal>
            <Modal
              open={openRemove}
              onClose={handleCloseRemove}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: '400px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  borderRadius: '12px',
                }}
              >
                <Typography id="modal-modal-title" variant="h6" sx={{ color: '#FF6F61', fontWeight: 700 }} component="h2">
                  Remove Item
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  <TextField
                    id="outlined-basic"
                    label="Quantity"
                    type="number"
                    variant="outlined"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </Stack>
                <Button
                  variant="contained"
                  onClick={() => {
                    removeItem(itemName, quantity);
                    setItemName('');
                    setQuantity(1);
                    handleCloseRemove();
                  }}
                  sx={{ mt: 2 }}
                >
                  Remove
                </Button>
              </Box>
            </Modal>
            <Box
              sx={{
                width: '100%',
                flex: 1,
                overflowY: 'auto',
                padding: 2,
                backgroundColor: '#F9F9F9',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Typography variant="h5" sx={{ color: '#FF6F61', fontWeight: 700 }}>
                Inventory Items
              </Typography>
              <InputBase
                placeholder="Search items..."
                value={searchTerm}
                onChange={handleSearch}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderRadius: '12px',
                  p: 1,
                  width: '100%',
                  maxWidth: '300px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                }}
              />
              <Grid container spacing={3}>
                {sortedFilteredInventory.map(({ name, quantity }) => (
                  <Grid item xs={12} sm={6} md={4} key={name}>
                    <Card sx={{ borderRadius: '12px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600 }}>
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontFamily: 'Raleway, sans-serif' }}>
                          Quantity: {quantity}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton onClick={() => removeItem(name, 1)} size="small">
                          <Remove sx={{ color: '#FF6F61' }} />
                        </IconButton>
                        <Typography sx={{ fontFamily: 'Raleway, sans-serif' }}>{quantity}</Typography>
                        <IconButton onClick={() => addItem(name, 1)} size="small">
                          <Add sx={{ color: '#FF6F61' }} />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Page;
