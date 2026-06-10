import dns from 'dns';

const hosts = [
  'nmkwhseqfbhrbzqldvcm.supabase.co',
  'db.nmkwhseqfbhrbzqldvcm.supabase.co',
  'db.nmkwhseqfbhrbzqldvcm.supabase.net',
  'aws-0-us-east-1.pooler.supabase.com'
];

hosts.forEach(host => {
  dns.lookup(host, (err, address, family) => {
    console.log(`dns.lookup for ${host}: IP=${address}, Family=${family}, Error=${err ? err.message : 'None'}`);
  });
});
