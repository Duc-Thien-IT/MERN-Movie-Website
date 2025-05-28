using System;

namespace Cau3
{
    public class Program
    {
        static void Main(string[] args)
        {
        }

        public int NchooseR(int n, int r)
        {
            if (r < 0 || n < 0 || r > n)
            {
                // Kết quả không hợp lệ
                return 0;
            }

            if (r == 0 || r == n)
            {
                return 1;
            }

            if (r > n - r)
            {
                r = n - r;
            }

            int result = 1;
            for (int i = 0; i < r; i++)
            {
                result *= (n - i);
                result /= (i + 1);
            }

            return result;
        }
    }
}
