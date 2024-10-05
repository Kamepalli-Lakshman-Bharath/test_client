// to replace with preview and also will return invalid if it does not contain any of this cases
export const useValidDriveLink = driveLink => {
  let trimedDriveLink = driveLink.split('?')[0].trim();
  if (trimedDriveLink.includes('preview')) {
    return trimedDriveLink;
  } else if (trimedDriveLink.includes('sharing')) {
    return trimedDriveLink.split('sharing')[0] + 'preview';
  } else if (trimedDriveLink.includes('edit')) {
    return trimedDriveLink.split('edit')[0] + 'preview';
  } else if (trimedDriveLink.includes('view')) {
    return trimedDriveLink.split('view')[0] + 'preview';
  } else {
    return 'Invalid Link';
  }
};

// for checking weather it is a drive link or not
export const isDriveLink = driveLink => {
  return driveLink.includes('https://drive.google.com/');
};
