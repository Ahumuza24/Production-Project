
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useAuth } from 'src/hooks/useAuth';
import { WorkSession } from 'src/types/work-session';
import { useWorkSessions } from 'src/hooks/useWorkSessions';


// ----------------------------------------------------------------------

type WorkSessionTableRowProps = {
  row: WorkSession;
  selected: boolean;
  onSelectRow: () => void;
};

export function WorkSessionTableRow({ row, selected, onSelectRow }: WorkSessionTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [partsCompletedInput, setPartsCompletedInput] = useState(row.parts_completed);
  const { endWorkSession } = useWorkSessions(useAuth().user?.id || '');

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleEndSession = async () => {
    await endWorkSession(row.id, partsCompletedInput);
    handleClosePopover();
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell>{row.projects.name}</TableCell>

        <TableCell>{row.components.name}</TableCell>

        <TableCell>{row.processes.name}</TableCell>

        <TableCell>
          <TextField
            type="number"
            value={partsCompletedInput}
            onChange={(e) => setPartsCompletedInput(Number(e.target.value))}
            size="small"
            sx={{ width: 80 }}
          />
        </TableCell>

        <TableCell>
          <Label color={(row.status === 'completed' && 'success') || (row.status === 'paused' && 'warning') || 'info'}>
            {row.status}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEndSession}>
            <Iconify icon="solar:check-circle-bold" />
            End Session
          </MenuItem>

          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
