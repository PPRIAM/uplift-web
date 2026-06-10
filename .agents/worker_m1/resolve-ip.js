import dns from 'dns';

dns.resolve('nmkwhseqfbhrbzqldvcm.supabase.co', 'ANY', (err, addresses) => {
  console.log('ANY:', addresses, err);
});

dns.resolve4('nmkwhseqfbhrbzqldvcm.supabase.co', (err, addresses) => {
  console.log('IPv4:', addresses, err);
});

dns.resolveCname('nmkwhseqfbhrbzqldvcm.supabase.co', (err, addresses) => {
  console.log('CNAME:', addresses, err);
});
